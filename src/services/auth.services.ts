import * as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import redis from '../config/redis';
import { IJwtPayload, OtpPurpose, Roles } from '../config';
import { SignUpResponseDto } from '../dto';
import { messages } from '../lang/api-messages';
import {
    BadRequestException,
    BranchEntity,
    BlackListTokenRepository,
    ConflictException,
    EmailQueue,
    NotFoundException,
    RoleRepository,
    UnauthorizedException,
    UserEntity,
    UserBranchEntity,
    UserRepository,
    comparePassword,
    generateTokens,
    otpGenerator,
} from '../utils';
import { EmailService } from '../utils/email.service';
import { WhatsAppContactService } from './whatsapp-contact.service';
import {
    AdminChangePasswordBodyPayload,
    AdminChangePasswordParamsPayload,
    ChangePasswordBodyPayload,
    ForgotPasswordBodyPayload,
    LoginBodyPayload,
    LogoutBodyPayload,
    RefreshTokenBodyPayload,
    ResentOtpBodyPayload,
    ResetPasswordBodyPayload,
    SignUpBodyPayload,
    VerifyOtpBodyPayload,
} from '../validations';

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_MAX_RESEND_ATTEMPTS = 3;
const OTP_RESEND_LOCK_MS = 24 * 60 * 60 * 1000;

interface RefreshTokenPayload extends jwt.JwtPayload {
    userId: string;
    email: string;
    roleId?: string;
    roleName?: string;
    sessionId?: string;
}

export class AuthService {
    private readonly whatsAppContactService = new WhatsAppContactService();

    constructor(
        private readonly userRepo: UserRepository,
        private readonly userRoleRepo: RoleRepository,
        private readonly blackListTokenRepo?: BlackListTokenRepository,
    ) {}

    async test(): Promise<string> {
        return 'test';
    }

    async signUp(body: SignUpBodyPayload): Promise<SignUpResponseDto> {
        const existingUser = await this.userRepo.findUserByEmailWithRole(body.email);
        if (existingUser) {
            throw new ConflictException(messages.userAlreadyRegistered);
        }

        await this.whatsAppContactService.ensureNumberExists(body.mobileNumber);

        const userRole = await this.userRoleRepo.findRoleByName(Roles.User);
        if (!userRole) {
            throw new NotFoundException(messages.roleNotFound);
        }

        try {
            const user = await this.userRepo.createUser({
                full_name: body.fullName,
                email: body.email,
                phone_no: body.mobileNumber,
                age: body.age,
                gender: body.gender,
                user_type: body.userType,
                userBranches: [
                    { branch: { id: body.branchId } as BranchEntity } as UserBranchEntity,
                ],
                performance_metrics: body.performanceMetrics,
                password: await bcrypt.hash(body.password, 10),
                is_terms_agreed: true,
                is_email_verified: false,
                status: true,
                role: userRole,
            });

            await this.issueSignupOtp(user, true);
            return new SignUpResponseDto({ ...user, role: userRole });
        } catch (error: unknown) {
            if ((error as { code?: string }).code === '23505') {
                throw new ConflictException(messages.userAlreadyRegistered);
            }

            throw error;
        }
    }

    async verifyOtp(body: VerifyOtpBodyPayload): Promise<SignUpResponseDto | void> {
        if (body.purpose === OtpPurpose.Signup) {
            return this.verifySignupOtp(body);
        }

        await this.verifyForgotPasswordOtp(body);
    }

    async resendOtp(body: ResentOtpBodyPayload): Promise<void> {
        if (body.purpose === OtpPurpose.Signup) {
            await this.resendSignupOtp(body);
            return;
        }

        await this.resendForgotPasswordOtp(body);
    }

    private async verifySignupOtp(body: VerifyOtpBodyPayload): Promise<SignUpResponseDto> {
        const user = await this.findActiveUserByEmail(body.email);
        if (user.is_email_verified) {
            throw new BadRequestException(messages.emailAlreadyVerified);
        }

        await this.ensureSignupOtpRequest(user);
        if (user.signup_otp !== body.otp) {
            throw new BadRequestException(messages.invalidOtp);
        }

        user.is_email_verified = true;
        this.clearSignupOtpState(user);
        await this.userRepo.updateUser(user);

        return this.createAuthResponse(user);
    }

    private async resendSignupOtp(body: ResentOtpBodyPayload): Promise<void> {
        const user = await this.findActiveUserByEmail(body.email);
        if (user.is_email_verified) {
            throw new BadRequestException(messages.emailAlreadyVerified);
        }

        this.unlockSignupOtpIfExpired(user);
        this.ensureOtpNotLocked(user.signup_otp_locked_until);
        if (!user.signup_otp) {
            throw new BadRequestException(messages.noOtpRequestFound);
        }

        await this.issueSignupOtp(user, false);
    }

    async login(body: LoginBodyPayload): Promise<SignUpResponseDto> {
        const user = await this.userRepo.findUserByEmail(body.email);
        if (!user || !user.password || !(await comparePassword(body.password, user.password))) {
            throw new UnauthorizedException(messages.invalidEmailAndPassword);
        }

        if (!user.status) {
            throw new UnauthorizedException(messages.userIsNotActive);
        }

        if (!user.is_email_verified) {
            throw new UnauthorizedException(messages.userNotVerified);
        }

        return this.createAuthResponse(user);
    }

    async logout(body: LogoutBodyPayload, user: IJwtPayload, accessToken?: string): Promise<void> {
        const decoded = this.verifyRefreshToken(body.refreshToken);
        if (
            !decoded.sessionId ||
            decoded.userId !== user.userId ||
            decoded.sessionId !== user.sessionId
        ) {
            throw new UnauthorizedException(messages.invalidToken);
        }

        const redisKey = `refresh:${user.userId}:${decoded.sessionId}`;
        const storedRefreshToken = await redis.get(redisKey);
        if (!storedRefreshToken || storedRefreshToken !== body.refreshToken) {
            throw new UnauthorizedException(messages.refreshTokenMismatch);
        }

        await redis.del(redisKey);
        if (accessToken && this.blackListTokenRepo) {
            const blacklistedToken =
                await this.blackListTokenRepo.findBlackListTokenByToken(accessToken);
            if (!blacklistedToken) {
                await this.blackListTokenRepo.createBlackListToken({
                    token: accessToken,
                    user: { id: user.userId } as UserEntity,
                });
            }
        }
    }

    async refreshToken(body: RefreshTokenBodyPayload): Promise<SignUpResponseDto> {
        const decoded = this.verifyRefreshToken(body.refreshToken);
        if (!decoded.userId || !decoded.sessionId) {
            throw new UnauthorizedException(messages.invalidToken);
        }

        const redisKey = `refresh:${decoded.userId}:${decoded.sessionId}`;
        const storedRefreshToken = await redis.get(redisKey);
        if (!storedRefreshToken || storedRefreshToken !== body.refreshToken) {
            throw new UnauthorizedException(messages.refreshTokenMismatch);
        }

        const user = await this.userRepo.findUserByIdWithRole(decoded.userId);
        if (!user || !user.status || !user.is_email_verified) {
            throw new UnauthorizedException(messages.invalidToken);
        }

        await redis.del(redisKey);
        return this.createAuthResponse(user);
    }

    async forgotPassword(body: ForgotPasswordBodyPayload): Promise<void> {
        const user = await this.findActiveVerifiedUserByEmail(body.email);
        this.ensureNormalUserRole(user);
        this.unlockForgotPasswordOtpIfExpired(user);
        this.ensureOtpNotLocked(user.forgot_password_otp_locked_until);
        user.forgot_password_otp_attempts = 0;
        user.forgot_password_otp_locked_until = null;
        await this.issueForgotPasswordOtp(user, true);
    }

    private async verifyForgotPasswordOtp(body: VerifyOtpBodyPayload): Promise<void> {
        const user = await this.findActiveVerifiedUserByEmail(body.email);
        this.ensureNormalUserRole(user);
        await this.ensureForgotPasswordOtpRequest(user);

        if (user.forgot_password_otp !== body.otp) {
            throw new BadRequestException(messages.invalidOtp);
        }

        user.forgot_password_otp = null;
        user.forgot_password_otp_expires_at = null;
        user.is_forgot_password_otp_verified = true;
        user.forgot_password_otp_verified_until = new Date(Date.now() + OTP_TTL_MS);
        await this.userRepo.updateUser(user);
    }

    private async resendForgotPasswordOtp(body: ResentOtpBodyPayload): Promise<void> {
        const user = await this.findActiveVerifiedUserByEmail(body.email);
        this.ensureNormalUserRole(user);
        this.unlockForgotPasswordOtpIfExpired(user);
        this.ensureOtpNotLocked(user.forgot_password_otp_locked_until);
        await this.ensureForgotPasswordOtpRequest(user);
        await this.issueForgotPasswordOtp(user, false);
    }

    async resetPassword(body: ResetPasswordBodyPayload): Promise<void> {
        const user = await this.findActiveVerifiedUserByEmail(body.email);
        this.ensureNormalUserRole(user);
        if (
            !user.is_forgot_password_otp_verified ||
            !user.forgot_password_otp_verified_until ||
            user.forgot_password_otp_verified_until.getTime() < Date.now()
        ) {
            throw new BadRequestException(messages.otpNotVerified);
        }

        user.password = await bcrypt.hash(body.password, 10);
        this.clearForgotPasswordOtpState(user);
        await this.userRepo.updateUser(user);
    }

    async adminChangePassword(
        params: AdminChangePasswordParamsPayload,
        body: AdminChangePasswordBodyPayload,
    ): Promise<void> {
        const user = await this.userRepo.findUserByIdWithRole(params.id);
        if (!user) {
            throw new NotFoundException(messages.userNotFound);
        }

        const allowedRoles = [Roles.SubAdmin, Roles.Trainer, Roles.User];
        if (!user.role || !allowedRoles.includes(user.role.name as Roles)) {
            throw new BadRequestException(messages.adminCanOnlyChangeManagedUserPassword);
        }

        user.password = await bcrypt.hash(body.password, 10);
        await this.userRepo.updateUser(user);
    }

    async changePassword(body: ChangePasswordBodyPayload, authUser: IJwtPayload): Promise<void> {
        const user = await this.userRepo.findUserByIdWithRole(authUser.userId);
        if (!user) {
            throw new NotFoundException(messages.userNotFound);
        }

        if (!user.password || !(await comparePassword(body.oldPassword, user.password))) {
            throw new BadRequestException(messages.invalidOldPassword);
        }

        user.password = await bcrypt.hash(body.newPassword, 10);
        await this.userRepo.updateUser(user);
    }

    private async createAuthResponse(user: UserEntity): Promise<SignUpResponseDto> {
        if (!user.role) {
            throw new UnauthorizedException(messages.invalidToken);
        }

        const { accessToken, refreshToken } = await generateTokens({
            userId: user.id,
            email: user.email,
            roleId: user.role.id,
            roleName: user.role.name,
        });
        return new SignUpResponseDto(user, accessToken, refreshToken);
    }

    private async findActiveUserByEmail(email: string): Promise<UserEntity> {
        const user = await this.userRepo.findUserByEmailWithRole(email);
        if (!user) {
            throw new NotFoundException(messages.userNotFound);
        }
        if (!user.status) {
            throw new UnauthorizedException(messages.userIsNotActive);
        }
        return user;
    }

    private async findActiveVerifiedUserByEmail(email: string): Promise<UserEntity> {
        const user = await this.findActiveUserByEmail(email);
        if (!user.is_email_verified) {
            throw new UnauthorizedException(messages.userNotVerified);
        }
        return user;
    }

    private ensureNormalUserRole(user: UserEntity): void {
        if (user.role?.name !== Roles.User) {
            throw new BadRequestException(messages.onlyUserCanUseForgotPassword);
        }
    }

    private async issueSignupOtp(user: UserEntity, isInitialRequest: boolean): Promise<void> {
        if (!isInitialRequest && user.signup_otp_resend_attempts >= OTP_MAX_RESEND_ATTEMPTS) {
            user.signup_otp_locked_until = new Date(Date.now() + OTP_RESEND_LOCK_MS);
            await this.userRepo.updateUser(user);
            throw new BadRequestException(messages.maxAttemptReached);
        }

        if (!isInitialRequest) {
            user.signup_otp_resend_attempts += 1;
            if (user.signup_otp_resend_attempts === OTP_MAX_RESEND_ATTEMPTS) {
                user.signup_otp_locked_until = new Date(Date.now() + OTP_RESEND_LOCK_MS);
            }
        }

        const otp = otpGenerator(6);
        user.signup_otp = otp;
        user.signup_otp_expires_at = new Date(Date.now() + OTP_TTL_MS);
        await this.userRepo.updateUser(user);
        this.publishOtpEmail(
            user,
            otp,
            'Verify your Vision-Arc account',
            '../templates/email/signup.html',
        );
    }

    private async issueForgotPasswordOtp(
        user: UserEntity,
        isInitialRequest: boolean,
    ): Promise<void> {
        if (!isInitialRequest && user.forgot_password_otp_attempts >= OTP_MAX_RESEND_ATTEMPTS) {
            user.forgot_password_otp_locked_until = new Date(Date.now() + OTP_RESEND_LOCK_MS);
            await this.userRepo.updateUser(user);
            throw new BadRequestException(messages.maxAttemptReached);
        }

        if (!isInitialRequest) {
            user.forgot_password_otp_attempts += 1;
            if (user.forgot_password_otp_attempts === OTP_MAX_RESEND_ATTEMPTS) {
                user.forgot_password_otp_locked_until = new Date(Date.now() + OTP_RESEND_LOCK_MS);
            }
        }

        const otp = otpGenerator(6);
        user.forgot_password_otp = otp;
        user.forgot_password_otp_expires_at = new Date(Date.now() + OTP_TTL_MS);
        user.is_forgot_password_otp_verified = false;
        user.forgot_password_otp_verified_until = null;
        await this.userRepo.updateUser(user);
        this.publishOtpEmail(
            user,
            otp,
            'Reset your Vision-Arc password',
            '../templates/email/forgotPassowrd.html',
        );
    }

    private publishOtpEmail(
        user: UserEntity,
        otp: string,
        subject: string,
        templateFile: string,
    ): void {
        EmailQueue.publishInBackground({
            to: user.email,
            subject,
            text: `Your OTP is ${otp}. It expires in 10 minutes.`,
            html: EmailService.prepareHtml(templateFile, {
                name: user.full_name || 'User',
                otp,
            }),
        });
    }

    private async ensureSignupOtpRequest(user: UserEntity): Promise<void> {
        if (!user.signup_otp || !user.signup_otp_expires_at) {
            throw new BadRequestException(messages.noOtpRequestFound);
        }
        if (user.signup_otp_expires_at.getTime() < Date.now()) {
            this.clearSignupOtpState(user);
            await this.userRepo.updateUser(user);
            throw new BadRequestException(messages.otpExpired);
        }
    }

    private async ensureForgotPasswordOtpRequest(user: UserEntity): Promise<void> {
        if (!user.forgot_password_otp || !user.forgot_password_otp_expires_at) {
            throw new BadRequestException(messages.noOtpRequestFound);
        }
        if (user.forgot_password_otp_expires_at.getTime() < Date.now()) {
            this.clearForgotPasswordOtpState(user);
            await this.userRepo.updateUser(user);
            throw new BadRequestException(messages.otpExpired);
        }
    }

    private ensureOtpNotLocked(lockedUntil: Date | null): void {
        if (lockedUntil && lockedUntil.getTime() > Date.now()) {
            throw new BadRequestException(messages.maxAttemptReached);
        }
    }

    private unlockSignupOtpIfExpired(user: UserEntity): void {
        if (user.signup_otp_locked_until && user.signup_otp_locked_until.getTime() <= Date.now()) {
            user.signup_otp_locked_until = null;
            user.signup_otp_resend_attempts = 0;
        }
    }

    private unlockForgotPasswordOtpIfExpired(user: UserEntity): void {
        if (
            user.forgot_password_otp_locked_until &&
            user.forgot_password_otp_locked_until.getTime() <= Date.now()
        ) {
            user.forgot_password_otp_locked_until = null;
            user.forgot_password_otp_attempts = 0;
        }
    }

    private clearSignupOtpState(user: UserEntity): void {
        user.signup_otp = null;
        user.signup_otp_expires_at = null;
        user.signup_otp_resend_attempts = 0;
        user.signup_otp_locked_until = null;
    }

    private clearForgotPasswordOtpState(user: UserEntity): void {
        user.forgot_password_otp = null;
        user.forgot_password_otp_expires_at = null;
        user.forgot_password_otp_attempts = 0;
        user.forgot_password_otp_locked_until = null;
        user.is_forgot_password_otp_verified = false;
        user.forgot_password_otp_verified_until = null;
    }

    private verifyRefreshToken(refreshToken: string): RefreshTokenPayload {
        try {
            return jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SALT || 'secret',
            ) as RefreshTokenPayload;
        } catch {
            throw new UnauthorizedException(messages.invalidToken);
        }
    }
}
