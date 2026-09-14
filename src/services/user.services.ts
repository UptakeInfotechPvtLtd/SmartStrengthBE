import * as bcrypt from 'bcryptjs';
import { IJwtPayload, Roles, UserStatus } from '../config';
import {
    UserListResponseDto,
    UserPerformanceMetricListResponseDto,
    UserPerformanceMetricResponseDto,
    UserResponseDto,
} from '../dto';
import { messages } from '../lang/api-messages';
import {
    BadRequestException,
    BranchEntity,
    BranchRepository,
    ConflictException,
    NotFoundException,
    RoleRepository,
    UnauthorizedException,
    UserBranchEntity,
    UserEntity,
    UserPerformanceMetricEntity,
    UserRepository,
    buildPagination,
} from '../utils';
import {
    CreateManagedUserBodyPayload,
    CreateUserMetricBodyPayload,
    FetchLoggedInUserPerformanceMetricsQueryPayload,
    FetchUsersQueryPayload,
    ManagedUserIdParamsPayload,
    UpdateManagedUserBodyPayload,
    UpdateManagedUserStatusBodyPayload,
    UpdateProfileBodyPayload,
} from '../validations';

export class UserService {
    constructor(
        private readonly userRepo: UserRepository,
        private readonly roleRepo: RoleRepository,
        private readonly branchRepo: BranchRepository,
    ) {}

    async addUser(
        body: CreateManagedUserBodyPayload,
        authUser: IJwtPayload,
    ): Promise<UserResponseDto> {
        const role = await this.getRole(body.roleId);
        const roleName = role.name as Roles;
        this.ensureCanCreateRole(authUser?.roleName as Roles, roleName);
        this.validatePayloadForRole(body, roleName, true);
        const branchIds = this.getPayloadBranchIds(body, roleName);
        await this.ensureBranchesAllowed(branchIds, authUser);
        await this.ensureEmailUnique(body.email);
        await this.ensurePhoneUnique(this.getPhoneNumber(body));

        const user = await this.userRepo.createUser({
            full_name: this.getName(body, roleName),
            phone_no: this.getPhoneNumber(body),
            email: body.email || null,
            password: body.password ? await bcrypt.hash(body.password, 10) : null,
            dob: roleName === Roles.User ? body.dob! : null,
            gender: roleName === Roles.User ? body.gender! : null,
            user_type: roleName === Roles.User ? body.userType! : null,
            profile_image_url: this.getProfileImgUrl(body),
            description: [Roles.Trainer].includes(role.name as Roles)
                ? body.description || null
                : null,
            experience_in_years:
                roleName === Roles.Trainer && body.experienceInYears !== undefined
                    ? body.experienceInYears.toFixed(2)
                    : null,
            performanceMetrics: [],
            status: body.status ?? UserStatus.Active,
            is_email_verified: true,
            is_terms_agreed: roleName === Roles.User,
            role,
            userBranches: this.createUserBranches(branchIds),
        });

        return new UserResponseDto((await this.userRepo.findUserByIdWithRole(user.id)) || user);
    }

    async updateUser(
        params: ManagedUserIdParamsPayload,
        body: UpdateManagedUserBodyPayload,
        authUser: IJwtPayload,
    ): Promise<UserResponseDto> {
        const user = await this.getUpdatableUser(params?.id, authUser);
        const role = await this.getRole(body.roleId);
        const roleName = role.name as Roles;
        this.ensureCanUpdateRole(authUser?.roleName as Roles, roleName);
        this.validatePayloadForRole(body, roleName, false);
        const branchIds = this.getPayloadBranchIds(body, roleName);
        if (branchIds.length) {
            await this.ensureBranchesAllowed(branchIds, authUser);
        }

        user.role = role;
        if (this.getName(body, roleName) !== undefined)
            user.full_name = this.getName(body, roleName)!;
        if (this.getPhoneNumber(body) !== undefined) {
            await this.ensurePhoneUnique(this.getPhoneNumber(body), user.id);
            user.phone_no = this.getPhoneNumber(body) ?? null;
        }
        const email = this.getEmail(body);
        if (email !== undefined) {
            await this.ensureEmailUnique(email, user.id);
            user.email = email || null;
        }
        if (body.dob !== undefined) user.dob = body.dob || null;
        if (body.gender !== undefined) user.gender = body.gender;
        if (body.userType !== undefined) user.user_type = body.userType;
        if ('profileImageUrl' in body) user.profile_image_url = body.profileImageUrl || null;
        if (body.description !== undefined) user.description = body.description;
        if (body.experienceInYears !== undefined) {
            user.experience_in_years = body.experienceInYears.toFixed(2);
        }
        if (body.password !== undefined) user.password = await bcrypt.hash(body.password, 10);
        if (body.status !== undefined) user.status = body.status;

        const updatedUser = await this.userRepo.updateUser(user);
        if (branchIds.length) {
            await this.userRepo.updateUserBranches(updatedUser, branchIds);
        }

        return new UserResponseDto(
            (await this.userRepo.findUserByIdWithRole(updatedUser?.id)) || updatedUser,
        );
    }

    async updateUserStatus(
        params: ManagedUserIdParamsPayload,
        body: UpdateManagedUserStatusBodyPayload,
        authUser: IJwtPayload,
    ): Promise<UserResponseDto> {
        const user = await this.getAccessibleUser(params.id, authUser);
        user.status = body.status;

        const updatedUser = await this.userRepo.updateUser(user);
        return new UserResponseDto(
            (await this.userRepo.findUserByIdWithRole(updatedUser?.id)) || updatedUser,
        );
    }

    async deleteUser(params: ManagedUserIdParamsPayload, authUser: IJwtPayload): Promise<void> {
        const user = await this.getAccessibleUser(params.id, authUser);
        await this.userRepo.softDeleteUser(user?.id);
    }

    async addUserMetric(
        params: ManagedUserIdParamsPayload,
        body: CreateUserMetricBodyPayload,
        authUser: IJwtPayload,
    ): Promise<UserPerformanceMetricResponseDto> {
        const user = await this.getAccessibleUser(params.id, authUser);
        this.ensurePerformanceMetricsAllowed(user);

        const performanceMetric = await this.userRepo.addUserPerformanceMetric(user, {
            metric_date: body.date,
            metrics: { [body.metricName]: body.resultValue },
        });

        return new UserPerformanceMetricResponseDto(performanceMetric);
    }

    async getUserById(
        params: ManagedUserIdParamsPayload,
        authUser: IJwtPayload,
    ): Promise<UserResponseDto> {
        return new UserResponseDto(await this.getAccessibleUser(params.id, authUser));
    }

    async viewProfile(authUser: IJwtPayload): Promise<UserResponseDto> {
        const user = await this.userRepo.findUserByIdWithRole(authUser?.userId);
        if (!user) {
            throw new NotFoundException(messages.userNotFound);
        }

        return new UserResponseDto(user);
    }

    async updateProfile(
        body: UpdateProfileBodyPayload,
        authUser: IJwtPayload,
    ): Promise<UserResponseDto> {
        const user = await this.userRepo.findUserByIdWithRole(authUser?.userId);
        if (!user) {
            throw new NotFoundException(messages.userNotFound);
        }

        if (body.fullName !== undefined) user.full_name = body.fullName;
        const phoneNumber = body.contactNumber ?? body.phoneNumber;
        if (phoneNumber !== undefined) user.phone_no = phoneNumber;
        if (body.age !== undefined) user.age = body.age;
        if (body.dob !== undefined) user.dob = body.dob || null;
        if (body.gender !== undefined) user.gender = body.gender;
        if (body.userType !== undefined) user.user_type = body.userType;
        const profileImageUrl = body.profilePicUrl ?? body.profileImageUrl;
        if (profileImageUrl !== undefined) user.profile_image_url = profileImageUrl;
        if (body.performanceMetrics !== undefined) {
            this.ensurePerformanceMetricsAllowed(user);
        }
        if (body.password !== undefined) user.password = await bcrypt.hash(body.password, 10);

        const updatedUser = await this.userRepo.updateUser(user);
        if (body.performanceMetrics !== undefined) {
            await this.addPerformanceMetricIfNotExists(updatedUser, body.performanceMetrics);
        }
        return new UserResponseDto(
            (await this.userRepo.findUserByIdWithRole(updatedUser?.id)) || updatedUser,
        );
    }

    async listLoggedInUserPerformanceMetrics(
        query: FetchLoggedInUserPerformanceMetricsQueryPayload,
        authUser: IJwtPayload,
    ): Promise<UserPerformanceMetricListResponseDto> {
        const user = await this.userRepo.findUserByIdWithRole(authUser?.userId);
        if (!user) {
            throw new NotFoundException(messages.userNotFound);
        }
        this.ensurePerformanceMetricsAllowed(user);

        const { performanceMetrics, total, page, pageSize, offset } =
            await this.userRepo.listUserPerformanceMetrics(authUser.userId, query);

        return new UserPerformanceMetricListResponseDto(
            performanceMetrics,
            buildPagination({ totalResults: total, page, pageSize, offset }),
        );
    }

    async listUsers(
        query: FetchUsersQueryPayload,
        authUser: IJwtPayload,
    ): Promise<UserListResponseDto> {
        const allowedRoles = this.getListVisibleRoles(authUser?.roleName as Roles);

        if (query.roleId) {
            const role = await this.getRole(query.roleId);
            if (!allowedRoles.includes(role.name as Roles)) {
                throw new UnauthorizedException(messages.cannotViewUserRole);
            }
        }

        if (query.branchIds?.length) {
            await this.ensureBranchesAllowed(query.branchIds, authUser);
        }

        if (query.branchId) {
            await this.ensureBranchesAllowed([query.branchId], authUser);
        }

        const assignedBranchIds =
            authUser?.roleName === Roles.SubAdmin
                ? await this.userRepo.findAssignedBranchIds(authUser?.userId)
                : undefined;

        const { users, total, page, pageSize, offset } = await this.userRepo.listUsers(
            query,
            allowedRoles,
            assignedBranchIds,
        );

        return new UserListResponseDto(
            users,
            buildPagination({ totalResults: total, page, pageSize, offset }),
        );
    }

    private async getAccessibleUser(userId: string, authUser: IJwtPayload): Promise<UserEntity> {
        const user = await this.userRepo.findUserByIdWithRole(userId);
        if (!user) {
            throw new NotFoundException(messages.userNotFound);
        }

        if (
            !user.role ||
            !this.getVisibleRoles(authUser?.roleName as Roles).includes(user?.role?.name as Roles)
        ) {
            throw new UnauthorizedException(messages.cannotManageUserRole);
        }

        if (authUser?.roleName === Roles.SubAdmin) {
            await this.ensureUserWithinAssignedBranches(user, authUser);
        }

        return user;
    }

    private async getUpdatableUser(userId: string, authUser: IJwtPayload): Promise<UserEntity> {
        const user = await this.userRepo.findUserByIdWithRole(userId);
        if (!user) {
            throw new NotFoundException(messages.userNotFound);
        }

        const authRole = authUser?.roleName as Roles;
        if (authRole === Roles.Admin) {
            return user;
        }

        if (authRole === Roles.SubAdmin) {
            if (![Roles.Trainer, Roles.User].includes(user?.role?.name as Roles)) {
                throw new UnauthorizedException(messages.cannotManageUserRole);
            }
            await this.ensureUserWithinAssignedBranches(user, authUser);
            return user;
        }

        throw new UnauthorizedException(messages.cannotManageUserRole);
    }

    private async getRole(roleId: string) {
        const role = await this.roleRepo.findRoleById(roleId);
        if (!role) {
            throw new NotFoundException(messages.roleNotFound);
        }

        return role;
    }

    private getVisibleRoles(roleName: Roles): Roles[] {
        if (roleName === Roles.Admin) {
            return [Roles.SubAdmin, Roles.Trainer, Roles.User];
        }

        if (roleName === Roles.SubAdmin) {
            return [Roles.Trainer, Roles.User];
        }

        return [];
    }

    private getListVisibleRoles(roleName: Roles): Roles[] {
        if (roleName === Roles.SubAdmin) {
            return [Roles.Trainer];
        }

        return this.getVisibleRoles(roleName);
    }

    private ensureCanCreateRole(authRole: Roles, targetRole: Roles): void {
        const allowedRoles = this.getVisibleRoles(authRole);
        if (!allowedRoles.includes(targetRole)) {
            throw new UnauthorizedException(messages.cannotCreateUserRole);
        }
    }

    private ensureCanUpdateRole(authRole: Roles, targetRole: Roles): void {
        if (authRole === Roles.Admin) {
            return;
        }

        if (authRole === Roles.SubAdmin && [Roles.Trainer, Roles.User].includes(targetRole)) {
            return;
        }

        throw new UnauthorizedException(messages.cannotUpdateUserRole);
    }

    private validatePayloadForRole(
        body: CreateManagedUserBodyPayload | UpdateManagedUserBodyPayload,
        roleName: Roles,
        isCreate: boolean,
    ): void {
        this.ensureNoUnexpectedFields(body, roleName, isCreate);
        if (!isCreate) return;

        if (roleName === Roles.SubAdmin) {
            if (
                !body.fullName ||
                !this.getEmail(body) ||
                !body.password ||
                !body.phoneNumber ||
                !body.branchIds
            ) {
                throw new BadRequestException(messages.subAdminFieldsRequired);
            }
        } else if (roleName === Roles.Trainer) {
            if (
                !body.fullName ||
                !body.profileImageUrl ||
                body.experienceInYears === undefined ||
                !body.description ||
                !body.branchIds
            ) {
                throw new BadRequestException(messages.trainerFieldsRequired);
            }
        } else if (roleName === Roles.User) {
            if (
                !body.fullName ||
                !this.getEmail(body) ||
                !body.phoneNumber ||
                !body.dob ||
                !body.gender ||
                !body.userType ||
                !body.password ||
                !this.getConfirmPassword(body) ||
                !body.branchIds
            ) {
                throw new BadRequestException(messages.normalUserFieldsRequired);
            }
            if (body.password !== this.getConfirmPassword(body)) {
                throw new BadRequestException(messages.passwordsDoNotMatch);
            }
        } else {
            throw new BadRequestException(messages.invalidRoleIdProvided);
        }
    }

    private async ensureEmailUnique(email?: string, userId?: string): Promise<void> {
        if (!email) return;
        const existingUser = await this.userRepo.findUserByEmailWithRole(email);
        if (existingUser && existingUser.id !== userId) {
            throw new ConflictException(messages.userAlreadyRegistered);
        }
    }

    private async ensurePhoneUnique(phoneNumber?: string | null, userId?: string): Promise<void> {
        if (!phoneNumber) return;
        const existingUser = await this.userRepo.findUserByPhoneWithRole(phoneNumber);
        if (existingUser && existingUser.id !== userId) {
            throw new ConflictException(messages.phoneNumberAlreadyRegistered);
        }
    }

    private async ensureBranchesAllowed(branchIds: string[], authUser: IJwtPayload): Promise<void> {
        const branches = await this.branchRepo.findActiveBranchesByIds(branchIds);
        if (branches.length !== new Set(branchIds).size) {
            throw new BadRequestException(messages.invalidBranchIds);
        }

        if (authUser?.roleName !== Roles.SubAdmin) return;

        const assignedBranchIds = await this.userRepo.findAssignedBranchIds(authUser?.userId);
        const hasUnauthorizedBranch = branchIds.some(
            (branchId) => !assignedBranchIds.includes(branchId),
        );
        if (hasUnauthorizedBranch) {
            throw new BadRequestException(messages.sessionBranchNotAssignedToSubAdmin);
        }
    }

    private createUserBranches(branchIds: string[]): UserBranchEntity[] {
        return branchIds.map(
            (branchId) =>
                ({
                    branch: { id: branchId } as BranchEntity,
                }) as UserBranchEntity,
        );
    }

    private ensurePerformanceMetricsAllowed(user: UserEntity): void {
        if (user?.role?.name !== Roles.User) {
            throw new BadRequestException(messages.performanceMetricsAllowedOnlyForNormalUser);
        }
    }

    private async ensureUserWithinAssignedBranches(
        user: UserEntity,
        authUser: IJwtPayload,
    ): Promise<void> {
        const assignedBranchIds = await this.userRepo.findAssignedBranchIds(authUser?.userId);
        const userBranchIds =
            user.userBranches?.map((userBranch) => userBranch.branch?.id).filter(Boolean) || [];
        if (!userBranchIds.every((branchId) => assignedBranchIds.includes(branchId))) {
            throw new UnauthorizedException(messages.cannotManageUserRole);
        }
    }

    private getPayloadBranchIds(
        body: CreateManagedUserBodyPayload | UpdateManagedUserBodyPayload,
        _roleName: Roles,
    ): string[] {
        return body.branchIds || [];
    }

    private getName(
        body: CreateManagedUserBodyPayload | UpdateManagedUserBodyPayload,
        _roleName: Roles,
    ): string | undefined {
        return body.fullName;
    }

    private getPhoneNumber(
        body: CreateManagedUserBodyPayload | UpdateManagedUserBodyPayload,
    ): string | undefined {
        return body.phoneNumber;
    }

    private getEmail(
        body: CreateManagedUserBodyPayload | UpdateManagedUserBodyPayload,
    ): string | undefined {
        return (body as CreateManagedUserBodyPayload).email;
    }

    private getConfirmPassword(
        body: CreateManagedUserBodyPayload | UpdateManagedUserBodyPayload,
    ): string | undefined {
        return (body as CreateManagedUserBodyPayload).confirmPassword;
    }

    private getProfileImgUrl(
        body: CreateManagedUserBodyPayload | UpdateManagedUserBodyPayload,
    ): string | null {
        return body.profileImageUrl || null;
    }

    private ensureNoUnexpectedFields(
        body: CreateManagedUserBodyPayload | UpdateManagedUserBodyPayload,
        roleName: Roles,
        isCreate: boolean,
    ): void {
        const commonFields = ['roleId', 'status'];
        const allowedByRole: Record<string, string[]> = {
            [Roles.SubAdmin]: [
                ...commonFields,
                'fullName',
                'email',
                'password',
                'phoneNumber',
                'branchIds',
            ],
            [Roles.Trainer]: [
                ...commonFields,
                'profileImageUrl',
                'fullName',
                'email',
                'password',
                'experienceInYears',
                'description',
                'branchIds',
            ],
            [Roles.User]: [
                ...commonFields,
                'profileImageUrl',
                'fullName',
                'email',
                'phoneNumber',
                'dob',
                'gender',
                'userType',
                'password',
                'confirmPassword',
                'branchIds',
            ],
        };
        const allowedFields = allowedByRole[roleName] || [];
        const unexpectedFields = Object.keys(body).filter(
            (key) => (body as any)[key] !== undefined && !allowedFields.includes(key),
        );

        if (unexpectedFields.length) {
            throw new BadRequestException(
                messages.unexpectedRoleFields(unexpectedFields.join(', ')),
            );
        }

        if (
            !isCreate &&
            body.password &&
            'confirmPassword' in body &&
            body.password !== body.confirmPassword
        ) {
            throw new BadRequestException(messages.passwordsDoNotMatch);
        }
    }

    private async addPerformanceMetric(
        user: UserEntity,
        performanceMetric: NonNullable<
            | CreateManagedUserBodyPayload['performanceMetrics']
            | UpdateManagedUserBodyPayload['performanceMetrics']
        >,
    ): Promise<void> {
        await this.userRepo.addUserPerformanceMetric(user, {
            metric_date: performanceMetric.date,
            metrics: performanceMetric.metrics,
        });
    }

    private async addPerformanceMetricIfNotExists(
        user: UserEntity,
        performanceMetric: NonNullable<
            | CreateManagedUserBodyPayload['performanceMetrics']
            | UpdateManagedUserBodyPayload['performanceMetrics']
        >,
    ): Promise<void> {
        const existingMetric = await this.userRepo.findPerformanceMetricByDate(
            user.id,
            performanceMetric.date,
        );

        if (existingMetric) {
            return;
        }

        await this.addPerformanceMetric(user, performanceMetric);
    }
}
