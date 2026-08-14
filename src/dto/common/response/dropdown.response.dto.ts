import {
    BranchStatus,
    Difficulty,
    Gender,
    MuscleGroup,
    OtpPurpose,
    UserType,
    VideoSource,
    VideoStatus,
} from '../../../config';
import { RoleEntity } from '../../../utils';

export class DropdownOptionDto {
    label!: string;
    value!: string;

    constructor(label: string, value: string) {
        this.label = label;
        this.value = value;
    }
}

export class CommonDropdownResponseDto {
    roles!: DropdownOptionDto[];
    genders!: DropdownOptionDto[];
    userTypes!: DropdownOptionDto[];
    otpPurposes!: DropdownOptionDto[];
    branchStatuses!: DropdownOptionDto[];
    brancheStatus!: DropdownOptionDto[];
    muscleGroups!: DropdownOptionDto[];
    difficulties!: DropdownOptionDto[];
    videoSources!: DropdownOptionDto[];
    videoStatuses!: DropdownOptionDto[];

    constructor(roles: RoleEntity[]) {
        this.roles = roles
            .filter((role) => Boolean(role?.id))
            .map((role) => new DropdownOptionDto(this.formatLabel(role?.name || ''), role?.id));
        this.genders = this.createEnumOptions(Gender);
        this.userTypes = this.createEnumOptions(UserType);
        this.otpPurposes = this.createEnumOptions(OtpPurpose);
        this.branchStatuses = this.createEnumOptions(BranchStatus);
        this.muscleGroups = this.createEnumOptions(MuscleGroup);
        this.difficulties = this.createEnumOptions(Difficulty);
        this.videoSources = this.createEnumOptions(VideoSource);
        this.videoStatuses = this.createEnumOptions(VideoStatus);
    }

    private createEnumOptions(enumObject: Record<string, string>): DropdownOptionDto[] {
        return Object.values(enumObject).map(
            (value) => new DropdownOptionDto(this.formatLabel(value), value),
        );
    }

    private formatLabel(value: string): string {
        return value.replace(/[-_]/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
    }
}

export class RoleDropdownResponseDto {
    roles!: DropdownOptionDto[];

    constructor(roles: RoleEntity[]) {
        this.roles = roles
            .filter((role) => Boolean(role?.id))
            .map((role) => new DropdownOptionDto(this.formatLabel(role?.name || ''), role?.id));
    }

    private formatLabel(value: string): string {
        return value.replace(/[-_]/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
    }
}
