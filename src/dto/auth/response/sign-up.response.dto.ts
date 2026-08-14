import { Gender, UserType } from '../../../config';
import { UserEntity } from '../../../utils';
import { UserPerformanceMetricResponseDto } from '../../user';
import { RoleResponse } from './AddUser.response.dto';

export class SignUpResponseDto {
    id!: string;
    fullName!: string | null;
    email!: string;
    mobileNumber!: string | null;
    age!: number | null;
    gender!: Gender | null;
    userType!: UserType | null;
    branchIds!: string[];
    performanceMetrics!: UserPerformanceMetricResponseDto[];
    isTermsAgreed!: boolean;
    accessToken!: string | null;
    refreshToken!: string | null;
    role!: RoleResponse | null;

    constructor(
        user?: UserEntity,
        accessToken: string | null = null,
        refreshToken: string | null = null,
    ) {
        this.id = user?.id || '';
        this.fullName = user?.full_name || null;
        this.email = user?.email || '';
        this.mobileNumber = user?.phone_no || null;
        this.age = user?.age || null;
        this.gender = user?.gender || null;
        this.userType = user?.user_type || null;
        this.branchIds =
            user?.userBranches?.map((userBranch) => userBranch.branch?.id).filter(Boolean) || [];
        this.performanceMetrics =
            user?.performanceMetrics?.map(
                (performanceMetric) => new UserPerformanceMetricResponseDto(performanceMetric),
            ) || [];
        this.isTermsAgreed = user?.is_terms_agreed || false;

        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.role = user?.role ? new RoleResponse(user?.role) : null;
    }
}

export class LoginResponseDto extends SignUpResponseDto {}

export class RefreshTokenResponseDto {
    accessToken!: string;
    refreshToken!: string;

    constructor(accessToken: string, refreshToken: string) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }
}
