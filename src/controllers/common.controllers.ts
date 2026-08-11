import { BaseResponseDto } from '../dto';
import { messages } from '../lang/api-messages';
import { CommonService } from '../services';

export class CommonController {
    constructor(private readonly commonService: CommonService) {
        this.getDropdown = this.getDropdown.bind(this);
        this.getRoleDropdown = this.getRoleDropdown.bind(this);
    }

    async getDropdown() {
        const result = await this.commonService.getDropdown();
        return new BaseResponseDto('', result);
    }

    async getRoleDropdown() {
        const result = await this.commonService.getRoleDropdown();
        return new BaseResponseDto(messages.rolesFetchedSuccessfully, result);
    }
}
