import { Gender, IPaginationMeta, UserType } from '../../../config';
import { RoleEntity, UserEntity } from '../../../utils';
import { BranchResponseDto } from '../../branch';

const formatMetricDate = (value?: string | null): string => {
    if (!value) return '';
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
};

export class UserPerformanceMetricResponseDto {
    id!: string;
    date!: string;
    metrics!: UserEntity['performanceMetrics'][number]['metrics'];
    createdAt!: Date;
    updatedAt!: Date;

    constructor(performanceMetric?: UserEntity['performanceMetrics'][number]) {
        this.id = performanceMetric?.id || '';
        this.date = formatMetricDate(performanceMetric?.metric_date);
        this.metrics = performanceMetric?.metrics || {};
        this.createdAt = performanceMetric?.created_at!;
        this.updatedAt = performanceMetric?.updated_at!;
    }
}

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
    profileImageUrl!: string | null;
    description!: string | null;
    performanceMetrics!: UserPerformanceMetricResponseDto[];
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
        this.profileImageUrl = user?.profile_image_url || null;
        this.description = user?.description || null;
        this.performanceMetrics =
            user?.performanceMetrics?.map(
                (performanceMetric) => new UserPerformanceMetricResponseDto(performanceMetric),
            ) || [];
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
