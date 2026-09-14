import { AccessPermission, IJwtPayload, Roles, availableAccessModules } from '../config';
import { AccessControlConfigResponseDto, AccessModuleResponseDto } from '../dto';
import { messages } from '../lang/api-messages';
import {
    AccessControlRepository,
    BadRequestException,
    ForbiddenException,
    RoleRepository,
    UserRepository,
} from '../utils';
import {
    GetAccessConfigQueryPayload,
    GetUserAccessConfigParamsPayload,
    UpsertAccessConfigBodyPayload,
    UpsertUserAccessConfigBodyPayload,
} from '../validations';
import { RoleAccessConfigParamsPayload } from '../validations/access-control.validations';

export class AccessControlService {
    constructor(
        private readonly accessControlRepo: AccessControlRepository,
        private readonly roleRepo: RoleRepository,
        private readonly userRepo: UserRepository,
    ) {}

    async getModules(authUser: IJwtPayload): Promise<AccessModuleResponseDto[]> {
        this.ensureMasterAdmin(authUser);
        const modules = await this.ensureModules();
        return modules.map((module) => new AccessModuleResponseDto(module));
    }

    async getAccessConfig(
        query: GetAccessConfigQueryPayload,
        authUser: IJwtPayload,
    ): Promise<AccessControlConfigResponseDto> {
        this.ensureMasterAdmin(authUser);
        const modules = await this.ensureModules();
        const role = await this.getRole(query.roleId);
        const accessControls = await this.accessControlRepo.findAccessConfig(query.roleId);

        return new AccessControlConfigResponseDto(modules, accessControls, role);
    }

    async getRoleAccessConfig(
        params: RoleAccessConfigParamsPayload,
        authUser: IJwtPayload,
    ): Promise<AccessControlConfigResponseDto> {
        this.ensureAccessConfigViewer(authUser);
        const modules = await this.ensureModules();
        const role = await this.getRole(params.roleId);
        const accessControls = await this.accessControlRepo.findAccessConfig(params.roleId);

        return new AccessControlConfigResponseDto(modules, accessControls, role);
    }

    async getUserAccessConfig(
        params: GetUserAccessConfigParamsPayload,
        authUser: IJwtPayload,
    ): Promise<AccessControlConfigResponseDto> {
        this.ensureMasterAdmin(authUser);
        const modules = await this.ensureModules();
        const user = await this.getConfigurableUser(params.userId);
        const accessControls = await this.accessControlRepo.findAccessConfig(undefined, user.id);

        return new AccessControlConfigResponseDto(modules, accessControls, user.role);
    }

    async getMyAccessConfig(authUser: IJwtPayload): Promise<AccessControlConfigResponseDto> {
        const modules = await this.ensureModules();
        const role = authUser?.roleId ? await this.getRole(authUser.roleId) : null;
        const accessControls = await this.accessControlRepo.findEffectiveAccessConfig(
            authUser?.roleId,
            authUser?.userId,
        );

        return new AccessControlConfigResponseDto(modules, accessControls, role);
    }

    async upsertAccessConfig(
        body: UpsertAccessConfigBodyPayload,
        authUser: IJwtPayload,
    ): Promise<AccessControlConfigResponseDto> {
        this.ensureMasterAdmin(authUser);
        const role = await this.getConfigurableRole(body.roleId);
        const modules = await this.ensureModules();
        const entries = this.buildAccessEntries(body.access, modules);

        await this.accessControlRepo.replaceRoleAccess(role.id, entries);
        const accessControls = await this.accessControlRepo.findAccessConfig(role.id);

        return new AccessControlConfigResponseDto(modules, accessControls, role);
    }

    async upsertUserAccessConfig(
        body: UpsertUserAccessConfigBodyPayload,
        authUser: IJwtPayload,
    ): Promise<AccessControlConfigResponseDto> {
        this.ensureMasterAdmin(authUser);
        const user = await this.getConfigurableUser(body.userId);
        const modules = await this.ensureModules();
        const entries = this.buildAccessEntries(body.access, modules);

        await this.accessControlRepo.replaceUserAccess(user.id, entries);
        const accessControls = await this.accessControlRepo.findAccessConfig(undefined, user.id);

        return new AccessControlConfigResponseDto(modules, accessControls, user.role);
    }

    private ensureMasterAdmin(authUser: IJwtPayload): void {
        if (authUser?.roleName !== Roles.Admin) {
            throw new ForbiddenException(messages.accessControlMasterAdminOnly);
        }
    }

    private ensureAccessConfigViewer(authUser: IJwtPayload): void {
        if (authUser?.roleName !== Roles.Admin && authUser?.roleName !== Roles.SubAdmin) {
            throw new ForbiddenException(messages.forbidden);
        }
    }

    private async ensureModules() {
        await this.accessControlRepo.upsertModules([...availableAccessModules]);
        return this.accessControlRepo.findAllModules();
    }

    private buildAccessEntries(
        access: UpsertAccessConfigBodyPayload['access'],
        modules: Awaited<ReturnType<AccessControlRepository['findAllModules']>>,
    ): { moduleId: string; permissions: AccessPermission[] }[] {
        const moduleByKey = new Map(modules.map((module) => [module.key, module]));
        const entriesByModuleId = new Map<string, Set<AccessPermission>>();

        access.forEach((entry) => {
            const module = moduleByKey.get(entry.moduleKey);
            if (!module) {
                throw new BadRequestException(messages.invalidAccessModule);
            }

            const permissions = entriesByModuleId.get(module.id) || new Set<AccessPermission>();
            entry.permissions.forEach((permission) => permissions.add(permission));
            entriesByModuleId.set(module.id, permissions);
        });

        return Array.from(entriesByModuleId.entries()).map(([moduleId, permissions]) => ({
            moduleId,
            permissions: Array.from(permissions),
        }));
    }

    private async getConfigurableRole(roleId: string) {
        const role = await this.getRole(roleId);

        if (role.name === Roles.Admin) {
            throw new BadRequestException(messages.cannotManageAdminUser);
        }

        return role;
    }

    private async getRole(roleId: string) {
        const role = await this.roleRepo.findRoleById(roleId);
        if (!role) {
            throw new BadRequestException(messages.roleNotFound);
        }

        return role;
    }

    private async getConfigurableUser(userId: string) {
        const user = await this.userRepo.findUserByIdWithRole(userId);
        if (!user) {
            throw new BadRequestException(messages.userNotFound);
        }

        if (user.role?.name === Roles.Admin) {
            throw new BadRequestException(messages.cannotManageAdminUser);
        }

        return user;
    }
}
