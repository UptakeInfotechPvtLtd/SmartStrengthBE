import { IAuthenticatedRequest } from '../config/interface';
import { BaseResponseDto } from '../dto';
import { messages } from '../lang/api-messages';
import { SlotService } from '../services';
import { AvailableSlotsQueryPayload } from '../validations';

export class SlotController {
    constructor(private readonly slotService: SlotService) {
        this.getAvailableSlots = this.getAvailableSlots.bind(this);
    }

    async getAvailableSlots(req: IAuthenticatedRequest<any, any, AvailableSlotsQueryPayload>) {
        const result = await this.slotService.getAvailableSlots(req.query, req.user);
        return new BaseResponseDto(messages.availableSlotsFetchedSuccessfully, result);
    }
}
