import { Gender, IPaginationMeta, UserType } from '../../../config';
import { RoleEntity, UserEntity } from '../../../utils';
import { BranchResponseDto } from '../../branch';

export class UserRoleResponseDto {
    id!: string;
    name!: string;

    constructor(role?: RoleEntity) {
        this.id = role?.id || '';
        this.name = role?.name || '';
    }
}

export class UserResponseDto {
    id!: string;
    fullName!: string | null;
    contactNumber!: string | null;
    email!: string;
    age!: number | null;
    gender!: Gender | null;
    userType!: UserType | null;
    performanceMetrics!: UserEntity['performance_metrics'];
    isEmailVerified!: boolean;
    status!: boolean;
    role!: UserRoleResponseDto | null;
    branches!: BranchResponseDto[];
    createdAt!: Date;
    updatedAt!: Date;

    constructor(user?: UserEntity) {
        this.id = user?.id || '';
        this.fullName = user?.full_name || null;
        this.contactNumber = user?.phone_no || null;
        this.email = user?.email || '';
        this.age = user?.age || null;
        this.gender = user?.gender || null;
        this.userType = user?.user_type || null;
        this.performanceMetrics = user?.performance_metrics || null;
        this.isEmailVerified = user?.is_email_verified || false;
        this.status = user?.status || false;
        this.role = user?.role ? new UserRoleResponseDto(user?.role) : null;
        this.branches =
            user?.userBranches
                ?.map((userBranch) =>
                    userBranch?.branch ? new BranchResponseDto(userBranch?.branch) : null,
                )
                .filter((branch): branch is BranchResponseDto => Boolean(branch)) || [];
        this.createdAt = user?.created_at!;
        this.updatedAt = user?.updated_at!;
    }
}

export class UserListResponseDto {
    results!: UserResponseDto[];
    pagination!: IPaginationMeta;

    constructor(users: UserEntity[], pagination: IPaginationMeta) {
        this.results = users.map((user) => new UserResponseDto(user));
        this.pagination = pagination;
    }
}
