export class AvailableSlotResponseDto {
    startTime!: string;
    endTime!: string;
    availableSlotCount!: number;
    reservedSlotCount!: number;
    availableTrainerCount!: number;
    availableTrainerIds!: string[];

    constructor(slot: {
        startTime: string;
        endTime: string;
        availableTrainerIds: string[];
        reservedTrainerIds: string[];
    }) {
        this.startTime = this.formatTime(slot.startTime);
        this.endTime = this.formatTime(slot.endTime);
        this.availableTrainerIds = slot.availableTrainerIds;
        this.availableTrainerCount = slot.availableTrainerIds.length;
        this.availableSlotCount = slot.availableTrainerIds.length;
        this.reservedSlotCount = slot.reservedTrainerIds.length;
    }

    private formatTime(time: string): string {
        if (!time) {
            return '';
        }

        const [hourValue, minuteValue] = time.split(':');
        const hour = Number(hourValue);
        const suffix = hour >= 12 ? 'PM' : 'AM';
        const displayHour = String(hour % 12 || 12).padStart(2, '0');

        return `${displayHour}:${minuteValue} ${suffix}`;
    }
}

export class AvailableSlotListResponseDto {
    branchId!: string;
    date!: string;
    slotDuration!: number;
    availableSlotCount!: number;
    reservedSlotCount!: number;
    results!: AvailableSlotResponseDto[];

    constructor(data: {
        branchId: string;
        date: string;
        slotDuration: number;
        slots: {
            startTime: string;
            endTime: string;
            availableTrainerIds: string[];
            reservedTrainerIds: string[];
        }[];
    }) {
        this.branchId = data.branchId;
        this.date = data.date;
        this.slotDuration = data.slotDuration;
        this.results = data.slots.map((slot) => new AvailableSlotResponseDto(slot));
        this.availableSlotCount = this.results.reduce(
            (total, slot) => total + slot.availableSlotCount,
            0,
        );
        this.reservedSlotCount = this.results.reduce(
            (total, slot) => total + slot.reservedSlotCount,
            0,
        );
    }
}
