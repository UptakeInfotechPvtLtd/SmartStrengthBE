import { Gender, UserType } from '../../../config';
import { UserEntity } from '../../../utils';
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
    performanceMetrics!: UserEntity['performance_metrics'];
    isTermsAgreed!: boolean;
    accessToken!: string | null;
    refreshToken!: string | null;
    role!: RoleResponse | null;

    constructor(
        user: UserEntity,
        accessToken: string | null = null,
        refreshToken: string | null = null,
    ) {
        this.id = user?.id;
        this.fullName = user?.full_name;
        this.email = user?.email;
        this.mobileNumber = user?.phone_no;
        this.age = user?.age;
        this.gender = user?.gender;
        this.userType = user?.user_type;
        this.branchIds =
            user?.userBranches?.map((userBranch) => userBranch.branch?.id).filter(Boolean) || [];
        this.performanceMetrics = user?.performance_metrics;
        this.isTermsAgreed = user?.is_terms_agreed;

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
