import {
    AthletePlayingLevel,
    AthleteSeasonStatus,
    AthleteSport,
    BranchStatus,
    CorporateEmployeesToBeCovered,
    CorporateEngagementModel,
    CorporateGymOnSite,
    CorporateRole,
    Difficulty,
    EnquiryType,
    Gender,
    IndividualCoachingPrimaryGoal,
    IndividualCoachingSessionsPerWeek,
    MuscleGroup,
    OtpPurpose,
    PackageType,
    SachinSessionSessionsPerWeek,
    SchoolProgrammeOfInterest,
    SchoolRole,
    SocietyCommercialPreference,
    SocietyExistingGym,
    SocietyRole,
    TrainingExperience,
    UserType,
    VideoSource,
    VideoStatus,
} from '../../../config/enum';
import { RoleEntity } from '../../../utils/database';

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
    packageTypes!: DropdownOptionDto[];
    enquiry!: {
        enquiryTypes: DropdownOptionDto[];
        individualCoachingPrimaryGoals: DropdownOptionDto[];
        trainingExperiences: DropdownOptionDto[];
        individualCoachingSessionsPerWeek: DropdownOptionDto[];
        athleteSports: DropdownOptionDto[];
        athletePlayingLevels: DropdownOptionDto[];
        athleteSeasonStatuses: DropdownOptionDto[];
        schoolRoles: DropdownOptionDto[];
        schoolProgrammeOfInterests: DropdownOptionDto[];
        corporateRoles: DropdownOptionDto[];
        corporateEngagementModels: DropdownOptionDto[];
        corporateEmployeesToBeCovered: DropdownOptionDto[];
        corporateGymOnSite: DropdownOptionDto[];
        societyRoles: DropdownOptionDto[];
        societyExistingGyms: DropdownOptionDto[];
        societyCommercialPreferences: DropdownOptionDto[];
        sachinSessionSessionsPerWeek: DropdownOptionDto[];
    };

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
        this.packageTypes = this.createEnumOptions(PackageType);
        this.enquiry = {
            enquiryTypes: this.createEnumOptions(EnquiryType),
            individualCoachingPrimaryGoals: this.createEnumOptions(IndividualCoachingPrimaryGoal),
            trainingExperiences: this.createEnumOptions(TrainingExperience),
            individualCoachingSessionsPerWeek: this.createEnumOptions(
                IndividualCoachingSessionsPerWeek,
            ),
            athleteSports: this.createEnumOptions(AthleteSport),
            athletePlayingLevels: this.createEnumOptions(AthletePlayingLevel),
            athleteSeasonStatuses: this.createEnumOptions(AthleteSeasonStatus),
            schoolRoles: this.createEnumOptions(SchoolRole),
            schoolProgrammeOfInterests: this.createEnumOptions(SchoolProgrammeOfInterest),
            corporateRoles: this.createEnumOptions(CorporateRole),
            corporateEngagementModels: this.createEnumOptions(CorporateEngagementModel),
            corporateEmployeesToBeCovered: this.createEnumOptions(CorporateEmployeesToBeCovered),
            corporateGymOnSite: this.createEnumOptions(CorporateGymOnSite),
            societyRoles: this.createEnumOptions(SocietyRole),
            societyExistingGyms: this.createEnumOptions(SocietyExistingGym),
            societyCommercialPreferences: this.createEnumOptions(SocietyCommercialPreference),
            sachinSessionSessionsPerWeek: this.createEnumOptions(SachinSessionSessionsPerWeek),
        };
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
