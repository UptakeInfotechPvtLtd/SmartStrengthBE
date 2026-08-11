import { Request } from 'express';
import { BaseResponseDto } from '../dto';
import { messages } from '../lang/api-messages';
import { CommonService } from '../services';

export class CommonController {
    constructor(private readonly commonService: CommonService) {
        this.getDropdown = this.getDropdown.bind(this);
        this.getRoleDropdown = this.getRoleDropdown.bind(this);
        this.uploadFile = this.uploadFile.bind(this);
    }

    async getDropdown() {
        const result = await this.commonService.getDropdown();
        return new BaseResponseDto('', result);
    }

    async getRoleDropdown() {
        const result = await this.commonService.getRoleDropdown();
        return new BaseResponseDto(messages.rolesFetchedSuccessfully, result);
    }

    async uploadFile(req: Request) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const result = this.commonService.uploadFile(req.file!, baseUrl);
        return new BaseResponseDto(messages.fileUploadedSuccessfully, result);
    }
}
