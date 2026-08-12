import * as bcrypt from 'bcryptjs';
import { IJwtPayload, Roles } from '../config';
import { UserListResponseDto, UserResponseDto } from '../dto';
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
    UserRepository,
    buildPagination,
} from '../utils';
import {
    CreateManagedUserBodyPayload,
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
        this.ensureCanCreateRole(authUser.roleName as Roles, role.name as Roles);
        this.validateCreatePayloadForRole(body, role.name as Roles);
        await this.ensureEmailUnique(body.email);
        await this.ensureBranchesExist(body.branchIds);

        const user = await this.userRepo.createUser({
            full_name: body.fullName,
            phone_no: body.contactNumber || null,
            email: body.email,
            password: await bcrypt.hash(body.password, 10),
            age: role.name === Roles.User ? body.age! : null,
            gender: role.name === Roles.User ? body.gender! : null,
            user_type: role.name === Roles.User ? body.userType! : null,
            performance_metrics: role.name === Roles.User ? body.performanceMetrics! : null,
            status: [Roles.SubAdmin, Roles.Trainer].includes(role.name as Roles)
                ? body.status!
                : true,
            is_email_verified: true,
            is_terms_agreed: role.name === Roles.User,
            role,
            userBranches: this.createUserBranches(body.branchIds),
        });

        return new UserResponseDto((await this.userRepo.findUserByIdWithRole(user.id)) || user);
    }

    async updateUser(
        params: ManagedUserIdParamsPayload,
        body: UpdateManagedUserBodyPayload,
        authUser: IJwtPayload,
    ): Promise<UserResponseDto> {
        const user = await this.getAccessibleUser(params.id, authUser);
        if (body.branchIds) {
            await this.ensureBranchesExist(body.branchIds);
        }

        if (body.fullName !== undefined) user.full_name = body.fullName;
        if (body.contactNumber !== undefined) user.phone_no = body.contactNumber;
        if (body.age !== undefined) user.age = body.age;
        if (body.gender !== undefined) user.gender = body.gender;
        if (body.userType !== undefined) user.user_type = body.userType;
        if (body.performanceMetrics !== undefined) user.performance_metrics = body.performanceMetrics;
        if (body.status !== undefined) user.status = body.status;

        const updatedUser = await this.userRepo.updateUser(user);
        if (body.branchIds) {
            await this.userRepo.updateUserBranches(updatedUser, body.branchIds);
        }

        return new UserResponseDto(
            (await this.userRepo.findUserByIdWithRole(updatedUser.id)) || updatedUser,
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
            (await this.userRepo.findUserByIdWithRole(updatedUser.id)) || updatedUser,
        );
    }

    async deleteUser(params: ManagedUserIdParamsPayload, authUser: IJwtPayload): Promise<void> {
        const user = await this.getAccessibleUser(params.id, authUser);
        await this.userRepo.softDeleteUser(user.id);
    }

    async getUserById(
        params: ManagedUserIdParamsPayload,
        authUser: IJwtPayload,
    ): Promise<UserResponseDto> {
        return new UserResponseDto(await this.getAccessibleUser(params.id, authUser));
    }

    async viewProfile(authUser: IJwtPayload): Promise<UserResponseDto> {
        const user = await this.userRepo.findUserByIdWithRole(authUser.userId);
        if (!user) {
            throw new NotFoundException(messages.userNotFound);
        }

        return new UserResponseDto(user);
    }

    async updateProfile(
        body: UpdateProfileBodyPayload,
        authUser: IJwtPayload,
    ): Promise<UserResponseDto> {
        const user = await this.userRepo.findUserByIdWithRole(authUser.userId);
        if (!user) {
            throw new NotFoundException(messages.userNotFound);
        }

        if (body.fullName !== undefined) user.full_name = body.fullName;
        if (body.contactNumber !== undefined) user.phone_no = body.contactNumber;
        if (body.age !== undefined) user.age = body.age;
        if (body.gender !== undefined) user.gender = body.gender;
        if (body.userType !== undefined) user.user_type = body.userType;
        if (body.performanceMetrics !== undefined) user.performance_metrics = body.performanceMetrics;

        const updatedUser = await this.userRepo.updateUser(user);
        return new UserResponseDto(
            (await this.userRepo.findUserByIdWithRole(updatedUser.id)) || updatedUser,
        );
    }

    async listUsers(
        query: FetchUsersQueryPayload,
        authUser: IJwtPayload,
    ): Promise<UserListResponseDto> {
        const allowedRoles = this.getVisibleRoles(authUser.roleName as Roles);

        if (query.roleId) {
            const role = await this.getRole(query.roleId);
            if (!allowedRoles.includes(role.name as Roles)) {
                throw new UnauthorizedException(messages.cannotViewUserRole);
            }
        }

        const { users, total, page, pageSize, offset } = await this.userRepo.listUsers(
            query,
            allowedRoles,
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
            !this.getVisibleRoles(authUser.roleName as Roles).includes(user.role.name as Roles)
        ) {
            throw new UnauthorizedException(messages.cannotManageUserRole);
        }

        return user;
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

    private ensureCanCreateRole(authRole: Roles, targetRole: Roles): void {
        const allowedRoles = this.getVisibleRoles(authRole);
        if (!allowedRoles.includes(targetRole)) {
            throw new UnauthorizedException(messages.cannotCreateUserRole);
        }
    }

    private validateCreatePayloadForRole(body: CreateManagedUserBodyPayload, roleName: Roles): void {
        if ([Roles.SubAdmin, Roles.Trainer].includes(roleName) && body.status === undefined) {
            throw new BadRequestException(messages.userStatusRequired);
        }

        if ([Roles.SubAdmin, Roles.Trainer].includes(roleName)) {
            if (!body.contactNumber) {
                throw new BadRequestException(messages.contactNumberRequired);
            }
            return;
        }

        if (roleName === Roles.User) {
            if (!body.contactNumber) throw new BadRequestException(messages.contactNumberRequired);
            if (!body.confirmPassword) {
                throw new BadRequestException(messages.confirmPasswordRequired);
            }
            if (body.password !== body.confirmPassword) {
                throw new BadRequestException(messages.passwordsDoNotMatch);
            }
            if (!body.age || !body.gender || !body.userType || !body.performanceMetrics) {
                throw new BadRequestException(messages.normalUserFieldsRequired);
            }
        }
    }

    private async ensureEmailUnique(email: string): Promise<void> {
        const existingUser = await this.userRepo.findUserByEmailWithRole(email);
        if (existingUser) {
            throw new ConflictException(messages.userAlreadyRegistered);
        }
    }

    private async ensureBranchesExist(branchIds: string[]): Promise<void> {
        const branches = await this.branchRepo.findActiveBranchesByIds(branchIds);
        if (branches.length !== new Set(branchIds).size) {
            throw new BadRequestException(messages.invalidBranchIds);
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
}
