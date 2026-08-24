import { AccessModule, AccessPermission } from '../../../config';
import { AccessControlEntity, AccessModuleEntity, RoleEntity } from '../../../utils';

export class AccessModuleResponseDto {
    id!: string;
    key!: AccessModule;
    name!: string;
    sortOrder!: number;
    permissions!: AccessPermission[];

    constructor(module?: AccessModuleEntity) {
        this.id = module?.id || '';
        this.key = module?.key!;
        this.name = module?.name || '';
        this.sortOrder = module?.sort_order || 0;
        this.permissions =
            module?.key === AccessModule.AccessControl
                ? [AccessPermission.Read, AccessPermission.Update, AccessPermission.Delete]
                : Object.values(AccessPermission);
    }
}

export class AccessRoleResponseDto {
    id!: string;
    name!: string;

    constructor(role?: RoleEntity | null) {
        this.id = role?.id || '';
        this.name = role?.name || '';
    }
}

export class AccessControlModuleMatrixDto {
    module!: AccessModuleResponseDto;
    permissions!: Record<AccessPermission, boolean>;

    constructor(module: AccessModuleEntity, accessControls: AccessControlEntity[]) {
        this.module = new AccessModuleResponseDto(module);
        this.permissions = Object.values(AccessPermission).reduce(
            (result, permission) => ({
                ...result,
                [permission]: accessControls.some(
                    (accessControl) =>
                        accessControl.module?.key === module.key &&
                        accessControl.permission === permission,
                ),
            }),
            {} as Record<AccessPermission, boolean>,
        );
    }
}

export class AccessControlConfigResponseDto {
    role!: AccessRoleResponseDto | null;
    modules!: AccessControlModuleMatrixDto[];

    constructor(
        modules: AccessModuleEntity[],
        accessControls: AccessControlEntity[],
        role?: RoleEntity | null,
    ) {
        this.role = role ? new AccessRoleResponseDto(role) : null;
        this.modules = modules.map(
            (module) => new AccessControlModuleMatrixDto(module, accessControls),
        );
    }
}
