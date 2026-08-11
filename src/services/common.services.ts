import { CommonDropdownResponseDto, RoleDropdownResponseDto, UploadFileResponseDto } from '../dto';
import { RoleRepository } from '../utils';

export class CommonService {
    constructor(private readonly roleRepo: RoleRepository) {}

    async getDropdown(): Promise<CommonDropdownResponseDto> {
        const roles = await this.roleRepo.findAllRoles();
        return new CommonDropdownResponseDto(roles);
    }

    async getRoleDropdown(): Promise<RoleDropdownResponseDto> {
        const roles = await this.roleRepo.findAllRoles();
        return new RoleDropdownResponseDto(roles);
    }

    uploadFile(file: Express.Multer.File, baseUrl: string): UploadFileResponseDto {
        return new UploadFileResponseDto(file, baseUrl);
    }
}
