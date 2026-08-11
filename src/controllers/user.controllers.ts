import { IAuthenticatedRequest } from '../config';
import { BaseResponseDto } from '../dto';
import { messages } from '../lang/api-messages';
import { UserService } from '../services';
import {
    CreateManagedUserBodyPayload,
    FetchUsersQueryPayload,
    ManagedUserIdParamsPayload,
    UpdateManagedUserBodyPayload,
    UpdateManagedUserStatusBodyPayload,
    UpdateProfileBodyPayload,
} from '../validations';

export class UserController {
    constructor(private readonly userService: UserService) {
        this.addUser = this.addUser.bind(this);
        this.updateUser = this.updateUser.bind(this);
        this.updateUserStatus = this.updateUserStatus.bind(this);
        this.getUserById = this.getUserById.bind(this);
        this.listUsers = this.listUsers.bind(this);
        this.viewProfile = this.viewProfile.bind(this);
        this.updateProfile = this.updateProfile.bind(this);
    }

    async addUser(req: IAuthenticatedRequest<any, CreateManagedUserBodyPayload>) {
        const result = await this.userService.addUser(req.body, req.user);
        return new BaseResponseDto(messages.newUserAddedSuccessfully, result);
    }

    async updateUser(
        req: IAuthenticatedRequest<ManagedUserIdParamsPayload, UpdateManagedUserBodyPayload>,
    ) {
        const result = await this.userService.updateUser(req.params, req.body, req.user);
        return new BaseResponseDto(messages.userUpdatedSuccessfully, result);
    }

    async updateUserStatus(
        req: IAuthenticatedRequest<ManagedUserIdParamsPayload, UpdateManagedUserStatusBodyPayload>,
    ) {
        const result = await this.userService.updateUserStatus(req.params, req.body, req.user);
        return new BaseResponseDto(messages.userStatusUpdatedSuccessfully, result);
    }

    async getUserById(req: IAuthenticatedRequest<ManagedUserIdParamsPayload>) {
        const result = await this.userService.getUserById(req.params, req.user);
        return new BaseResponseDto('', result);
    }

    async listUsers(req: IAuthenticatedRequest<any, any, FetchUsersQueryPayload>) {
        const result = await this.userService.listUsers(req.query, req.user);
        return new BaseResponseDto('', result);
    }

    async viewProfile(req: IAuthenticatedRequest) {
        const result = await this.userService.viewProfile(req.user);
        return new BaseResponseDto('', result);
    }

    async updateProfile(req: IAuthenticatedRequest<any, UpdateProfileBodyPayload>) {
        const result = await this.userService.updateProfile(req.body, req.user);
        return new BaseResponseDto(messages.profileUpdatedSuccessfully, result);
    }
}
