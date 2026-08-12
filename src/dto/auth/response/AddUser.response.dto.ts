import { Gender, UserType } from '../../../config';
import { RoleEntity, UserEntity } from '../../../utils';

export class RoleResponse {
    id!: string;
    name!: string;

    constructor(role?: RoleEntity) {
        this.id = role?.id || '';
        this.name = role?.name || '';
    }
}

export class AddUserResponseDto {
    id!: string;
    fullName!: string | null;
    mobileNumber!: string | null;
    email!: string;
    age!: number | null;
    gender!: Gender | null;
    userType!: UserType | null;
    branchIds!: string[];
    performanceMetrics!: UserEntity['performance_metrics'];
    isTermsAgreed!: boolean;
    isEmailVerified!: boolean;
    status!: boolean;
    role!: RoleResponse | null;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(user?: UserEntity) {
        this.id = user?.id || '';
        this.fullName = user?.full_name ?? null;
        this.mobileNumber = user?.phone_no ?? null;
        this.email = user?.email || '';
        this.age = user?.age ?? null;
        this.gender = user?.gender ?? null;
        this.userType = user?.user_type ?? null;
        this.branchIds =
            user?.userBranches?.map((userBranch) => userBranch.branch?.id).filter(Boolean) || [];
        this.performanceMetrics = user?.performance_metrics ?? null;
        this.isTermsAgreed = user?.is_terms_agreed ?? false;
        this.isEmailVerified = user?.is_email_verified ?? true;
        this.status = user?.status || false;
        this.role = user?.role ? new RoleResponse(user?.role) : null;
        this.createdAt = user?.created_at!;
        this.updatedAt = user?.updated_at!;
    }
}
