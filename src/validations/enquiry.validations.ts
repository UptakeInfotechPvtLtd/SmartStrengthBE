import { z } from 'zod';
import {
    AthletePlayingLevel,
    AthleteSeasonStatus,
    AthleteSport,
    CorporateEmployeesToBeCovered,
    CorporateEngagementModel,
    CorporateGymOnSite,
    CorporateRole,
    EnquiryType,
    IndividualCoachingPrimaryGoal,
    IndividualCoachingSessionsPerWeek,
    SachinSessionSessionsPerWeek,
    SchoolProgrammeOfInterest,
    SchoolRole,
    SortOrder,
    SocietyCommercialPreference,
    SocietyExistingGym,
    SocietyRole,
    TrainingExperience,
} from '../config';
import { validationMessages } from '../lang/api-messages';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9+\-\s()]+$/;

const requiredString = (message: string) =>
    z.string({ error: message }).trim().min(1, { error: message });

const textField = (requiredMessage: string) =>
    requiredString(requiredMessage).max(2000, { error: validationMessages.enquiry.textMaxLength });

const optionalString = (message: string) =>
    z
        .union([z.string({ error: message }).trim(), z.null()])
        .optional()
        .transform((value) => (value === null ? undefined : value));

const uuidSchema = (message: string) =>
    requiredString(message).refine((value) => uuidRegex.test(value), { error: message });

const baseEnquirySchema = z
    .object({
        fullName: requiredString(validationMessages.enquiry.fullNameRequired).max(150, {
            error: validationMessages.enquiry.fullNameMaxLength,
        }),
        mobileNumber: requiredString(validationMessages.enquiry.mobileNumberRequired)
            .max(20, { error: validationMessages.enquiry.mobileNumberMaxLength })
            .refine((value) => phoneRegex.test(value), {
                error: validationMessages.enquiry.mobileNumberInvalid,
            }),
        email: requiredString(validationMessages.enquiry.emailRequired)
            .max(255, { error: validationMessages.enquiry.emailMaxLength })
            .refine((value) => emailRegex.test(value), {
                error: validationMessages.enquiry.emailInvalid,
            }),
        branchId: uuidSchema(validationMessages.enquiry.branchIdInvalid),
    })
    .strict();

const individualCoachingSchema = baseEnquirySchema.extend({
    enquiryType: z.literal(EnquiryType.IndividualCoaching),
    primaryGoal: z.enum(IndividualCoachingPrimaryGoal, {
        error: validationMessages.enquiry.primaryGoalInvalid,
    }),
    age: z.coerce
        .number({ error: validationMessages.enquiry.ageInvalid })
        .int({ error: validationMessages.enquiry.ageInvalid })
        .positive({ error: validationMessages.enquiry.ageInvalid }),
    trainingExperience: z.enum(TrainingExperience, {
        error: validationMessages.enquiry.trainingExperienceInvalid,
    }),
    sessionsPerWeek: z.enum(IndividualCoachingSessionsPerWeek, {
        error: validationMessages.enquiry.sessionsPerWeekInvalid,
    }),
    injuriesOrMedicalConditions: textField(
        validationMessages.enquiry.injuriesOrMedicalConditionsRequired,
    ),
});

const athletePerformanceSchema = baseEnquirySchema.extend({
    enquiryType: z.literal(EnquiryType.AthletePerformance),
    sports: z.enum(AthleteSport, { error: validationMessages.enquiry.sportsInvalid }),
    playingLevel: z.enum(AthletePlayingLevel, {
        error: validationMessages.enquiry.playingLevelInvalid,
    }),
    positionOrDiscipline: requiredString(
        validationMessages.enquiry.positionOrDisciplineRequired,
    ).max(255, { error: validationMessages.enquiry.shortTextMaxLength }),
    seasonStatus: z.enum(AthleteSeasonStatus, {
        error: validationMessages.enquiry.seasonStatusInvalid,
    }),
    injuryHistoryAndCurrentNiggles: textField(
        validationMessages.enquiry.injuryHistoryAndCurrentNigglesRequired,
    ),
});

const schoolsSchema = baseEnquirySchema.extend({
    enquiryType: z.literal(EnquiryType.Schools),
    schoolName: requiredString(validationMessages.enquiry.schoolNameRequired).max(255, {
        error: validationMessages.enquiry.shortTextMaxLength,
    }),
    yourRole: z.enum(SchoolRole, { error: validationMessages.enquiry.yourRoleInvalid }),
    programmeOfInterest: z.enum(SchoolProgrammeOfInterest, {
        error: validationMessages.enquiry.programmeOfInterestInvalid,
    }),
    sportsPlayedAtSchool: requiredString(
        validationMessages.enquiry.sportsPlayedAtSchoolRequired,
    ).max(255, { error: validationMessages.enquiry.shortTextMaxLength }),
    numberOfStudentsOrSquadSize: z.coerce
        .number({ error: validationMessages.enquiry.numberOfStudentsOrSquadSizeInvalid })
        .int({ error: validationMessages.enquiry.numberOfStudentsOrSquadSizeInvalid })
        .positive({ error: validationMessages.enquiry.numberOfStudentsOrSquadSizeInvalid }),
    anythingElseAboutSportsCalendar: textField(
        validationMessages.enquiry.anythingElseAboutSportsCalendarRequired,
    ),
});

const corporateWellnessSchema = baseEnquirySchema.extend({
    enquiryType: z.literal(EnquiryType.CorporateWellness),
    companyName: requiredString(validationMessages.enquiry.companyNameRequired).max(255, {
        error: validationMessages.enquiry.shortTextMaxLength,
    }),
    yourRole: z.enum(CorporateRole, { error: validationMessages.enquiry.yourRoleInvalid }),
    engagementModel: z.enum(CorporateEngagementModel, {
        error: validationMessages.enquiry.engagementModelInvalid,
    }),
    employeesToBeCovered: z.enum(CorporateEmployeesToBeCovered, {
        error: validationMessages.enquiry.employeesToBeCoveredInvalid,
    }),
    gymOnSite: z.enum(CorporateGymOnSite, {
        error: validationMessages.enquiry.gymOnSiteInvalid,
    }),
    servicesOfInterest: textField(validationMessages.enquiry.servicesOfInterestRequired),
});

const societyPartnershipsSchema = baseEnquirySchema.extend({
    enquiryType: z.literal(EnquiryType.SocietyPartnerships),
    societyOrProjectName: requiredString(
        validationMessages.enquiry.societyOrProjectNameRequired,
    ).max(255, { error: validationMessages.enquiry.shortTextMaxLength }),
    yourRole: z.enum(SocietyRole, { error: validationMessages.enquiry.yourRoleInvalid }),
    numberOfUnitsOrResidents: requiredString(
        validationMessages.enquiry.numberOfUnitsOrResidentsRequired,
    ).max(255, { error: validationMessages.enquiry.shortTextMaxLength }),
    existingGym: z.enum(SocietyExistingGym, {
        error: validationMessages.enquiry.existingGymInvalid,
    }),
    commercialPreference: z.enum(SocietyCommercialPreference, {
        error: validationMessages.enquiry.commercialPreferenceInvalid,
    }),
    addOnsOfInterest: textField(validationMessages.enquiry.addOnsOfInterestRequired),
});

const sessionWithSachinRanaSchema = baseEnquirySchema.extend({
    enquiryType: z.literal(EnquiryType.SessionWithSachinRana),
    primaryGoal: requiredString(validationMessages.enquiry.primaryGoalRequired).max(255, {
        error: validationMessages.enquiry.shortTextMaxLength,
    }),
    sportOrProfession: requiredString(validationMessages.enquiry.sportOrProfessionRequired).max(
        255,
        { error: validationMessages.enquiry.shortTextMaxLength },
    ),
    preferredDaysAndTimes: requiredString(
        validationMessages.enquiry.preferredDaysAndTimesRequired,
    ).max(255, { error: validationMessages.enquiry.shortTextMaxLength }),
    sessionsPerWeek: z.enum(SachinSessionSessionsPerWeek, {
        error: validationMessages.enquiry.sessionsPerWeekInvalid,
    }),
    injuriesOrMedicalConditions: textField(
        validationMessages.enquiry.injuriesOrMedicalConditionsRequired,
    ),
});

export const createEnquirySchema = {
    body: z.discriminatedUnion('enquiryType', [
        individualCoachingSchema,
        athletePerformanceSchema,
        schoolsSchema,
        corporateWellnessSchema,
        societyPartnershipsSchema,
        sessionWithSachinRanaSchema,
    ]),
};

export const enquiryIdSchema = {
    params: z
        .object({
            id: uuidSchema(validationMessages.enquiry.enquiryIdInvalid),
        })
        .strict(),
};

export const listEnquiriesSchema = {
    query: z
        .object({
            page: z.coerce.number().int().positive().optional(),
            pageSize: z.coerce.number().int().positive().max(100).optional(),
            search: optionalString(validationMessages.enquiry.searchString).pipe(
                z
                    .string()
                    .max(255, { error: validationMessages.enquiry.searchMaxLength })
                    .optional(),
            ),
            orderBy: z
                .enum([
                    'full_name',
                    'email',
                    'mobile_number',
                    'enquiry_type',
                    'created_at',
                    'updated_at',
                ])
                .optional()
                .default('created_at'),
            order: z
                .enum(SortOrder)
                .optional()
                .default(SortOrder.DESC)
                .transform((value) => value.toUpperCase() as 'ASC' | 'DESC'),
        })
        .strict(),
};

export type CreateEnquiryBodyPayload = z.infer<typeof createEnquirySchema.body>;
export type EnquiryIdParamsPayload = z.infer<typeof enquiryIdSchema.params>;
export type FetchEnquiriesQueryPayload = z.infer<typeof listEnquiriesSchema.query>;
