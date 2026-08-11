import { BaseResponseDto } from '../dto';
import { messages } from '../lang/api-messages';
import { AuthService } from '../services/auth.services';
import { Request } from 'express';
import { IAuthenticatedRequest, OtpPurpose } from '../config';
import {
    AdminChangePasswordBodyPayload,
    AdminChangePasswordParamsPayload,
    ChangePasswordBodyPayload,
    ForgotPasswordBodyPayload,
    LogoutBodyPayload,
    RefreshTokenBodyPayload,
    ResentOtpBodyPayload,
    ResetPasswordBodyPayload,
    VerifyOtpBodyPayload,
    SignUpBodyPayload,
} from '../validations';

export class AuthController {
    constructor(private readonly authService: AuthService) {
        this.test = this.test.bind(this);

        this.login = this.login.bind(this);
        this.signUp = this.signUp.bind(this);
        this.refreshToken = this.refreshToken.bind(this);
        this.logout = this.logout.bind(this);
        this.changePassword = this.changePassword.bind(this);
        this.adminChangePassword = this.adminChangePassword.bind(this);
        this.forgotPassword = this.forgotPassword.bind(this);
        this.verifyOtp = this.verifyOtp.bind(this);
        this.resendOtp = this.resendOtp.bind(this);
        this.resetPassword = this.resetPassword.bind(this);
    }

    async test() {
        const result = await this.authService.test();
        return new BaseResponseDto(messages.testSuccessful, result);
    }

    async login(req: Request) {
        const result = await this.authService.login(req.body);
        return new BaseResponseDto(messages.loginSuccessfully, result);
    }

    async signUp(req: Request<any, any, SignUpBodyPayload>) {
        const result = await this.authService.signUp(req.body);
        return new BaseResponseDto(messages.signupOtpSentSuccessfully, result);
    }

    async refreshToken(req: Request<any, any, RefreshTokenBodyPayload>) {
        const result = await this.authService.refreshToken(req?.body);
        return new BaseResponseDto(messages.refreshTokenSuccessfully, result);
    }

    async logout(req: IAuthenticatedRequest<any, LogoutBodyPayload>) {
        const accessToken = req?.headers?.authorization?.split(' ')?.[1];
        const result = await this.authService.logout(req?.body, req?.user, accessToken);
        return new BaseResponseDto(messages.logoutSuccessfully, result);
    }

    async changePassword(req: IAuthenticatedRequest<any, ChangePasswordBodyPayload>) {
        const result = await this.authService.changePassword(req?.body, req?.user);
        return new BaseResponseDto(messages.passwordChangedSuccessfully, result);
    }

    async adminChangePassword(
        req: IAuthenticatedRequest<AdminChangePasswordParamsPayload, AdminChangePasswordBodyPayload>,
    ) {
        const result = await this.authService.adminChangePassword(req.params, req.body);
        return new BaseResponseDto(messages.passwordChangedSuccessfully, result);
    }

    async forgotPassword(req: Request<any, any, ForgotPasswordBodyPayload>) {
        const result = await this.authService.forgotPassword(req?.body);
        return new BaseResponseDto(messages.forgotPasswordSuccessfully, result);
    }

    async verifyOtp(req: Request<any, any, VerifyOtpBodyPayload>) {
        const result = await this.authService.verifyOtp(req?.body);
        const message =
            req.body.purpose === OtpPurpose.Signup
                ? messages.signupOtpVerifiedSuccessfully
                : messages.otpVerifiedSuccessfully;
        return new BaseResponseDto(message, result);
    }

    async resendOtp(req: Request<any, any, ResentOtpBodyPayload>) {
        const result = await this.authService.resendOtp(req?.body);
        const message =
            req.body.purpose === OtpPurpose.Signup
                ? messages.signupOtpResentSuccessfully
                : messages.otpResentSuccessfully;
        return new BaseResponseDto(message, result);
    }

    async resetPassword(req: Request<any, any, ResetPasswordBodyPayload>) {
        const result = await this.authService.resetPassword(req?.body);
        return new BaseResponseDto(messages.passwordResetSuccessfully, result);
    }
}
