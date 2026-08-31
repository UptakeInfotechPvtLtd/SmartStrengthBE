export enum Roles {
    User = 'user',
    Admin = 'admin',
    SubAdmin = 'sub_admin',
    Trainer = 'trainer',
}

export enum Gender {
    Male = 'male',
    Female = 'female',
    Other = 'other',
}

export enum UserType {
    Student = 'student',
    Athlete = 'athlete',
}

export enum PackageType {
    Standard = 'Standard',
    Athlete = 'Athlete',
}

export enum UserStatus {
    Active = 'active',
    Inactive = 'inactive',
}

export enum AccessModule {
    StaffManagement = 'staff_management',
    AccessControl = 'access_control',
    UserManagement = 'user_management',
    BranchManagement = 'branch_management',
    BookingManagement = 'booking_management',
    SlotMaintenance = 'slot_maintenance',
    RosterManagement = 'roster_management',
    TestimonialManagement = 'testimonial_management',
    SingleSessionManagement = 'single_session_management',
    PackageManagement = 'package_management',
    TrainWithSachinManagement = 'train_with_sachin_management',
    VideoManagement = 'video_management',
    Reports = 'reports',
}

export enum BranchAvailabilityStatus {
    Open = 'open',
    FullyOff = 'fully off',
}

export enum TrainerAvailabilityStatus {
    Available = 'available',
    Unavailable = 'unavailable',
}

export enum RosterStatus {
    Working = 'working',
    DayOff = 'dayoff',
}

export enum RosterDay {
    Monday = 'monday',
    Tuesday = 'tuesday',
    Wednesday = 'wednesday',
    Thursday = 'thursday',
    Friday = 'friday',
    Saturday = 'saturday',
}

export enum AccessPermission {
    Read = 'read',
    Create = 'create',
    Update = 'update',
    Delete = 'delete',
}

export enum OtpPurpose {
    Signup = 'signup',
    ForgotPassword = 'forgot-password',
}

export enum BranchStatus {
    Active = 'Active',
    Inactive = 'Inactive',
}

export enum BranchOrderBy {
    BranchName = 'branchName',
    OpeningTime = 'openingTime',
    ClosingTime = 'closingTime',
    CreatedAt = 'createdAt',
    UpdatedAt = 'updatedAt',
}

export enum SortOrder {
    ASC = 'ASC',
    DESC = 'DESC',
    Asc = 'asc',
    Desc = 'desc',
}

export enum MuscleGroup {
    Legs = 'Legs',
    Shoulders = 'Shoulders',
    Back = 'Back',
}

export enum Difficulty {
    Expert = 'Expert',
    Beginner = 'Beginner',
    Intermediate = 'Intermediate',
}

export enum VideoSource {
    Uploaded = 'uploaded',
    YoutubeLink = 'youtube_link',
}

export enum VideoStatus {
    Active = 'active',
    Inactive = 'inactive',
}

export enum TestimonialStatus {
    Pending = 'Pending',
    Approved = 'Approved',
    Rejected = 'Rejected',
}

export enum EnquiryType {
    IndividualCoaching = 'Individual Coaching',
    AthletePerformance = 'Athlete Performance',
    Schools = 'Schools',
    CorporateWellness = 'Corporate Wellness',
    SocietyPartnerships = 'Society Partnerships',
    SessionWithSachinRana = 'Session With Sachin Rana',
}

export enum IndividualCoachingPrimaryGoal {
    FatLossAndBodyComposition = 'Fat loss and body composition',
    StrengthAndMuscle = 'Strength and muscle',
    PainFreeMovement = 'Pain-free movement',
    GeneralFitness = 'General fitness',
    EnergyAndLongevity = 'Enegy and longevity',
}

export enum TrainingExperience {
    NewToTraining = 'new to training',
    UnderOneYear = 'Under 1 Year',
    OneToThreeYears = '1 to 3 Years',
    MoreThanThreeYears = 'More than 3 Years',
}

export enum IndividualCoachingSessionsPerWeek {
    TwoSessions = '2 sessions',
    ThreeSessions = '3 sessions',
    FourSession = '4 session',
    FiveOrMoreSessions = '5 or more sessions',
}

export enum AthleteSport {
    Cricket = 'Cricket',
    Football = 'Football',
    Golf = 'Golf',
    Tennis = 'Tennis',
    Badminton = 'Badminton',
    Swimming = 'Swimming',
    Athletics = 'Athletics',
    Other = 'Other',
}

export enum AthletePlayingLevel {
    SchoolOrAcademy = 'School or Academy',
    StateOrClub = 'State or club',
    National = 'National',
    Professional = 'Professional',
}

export enum AthleteSeasonStatus {
    OffSession = 'off-session',
    PreSession = 'pre-session',
    InSession = 'in-session',
    ReturningFromInjury = 'Returning from injury',
}

export enum SchoolRole {
    SportsDepartment = 'Sports Department',
    PrincipalOrHead = 'Principal or head',
    Coach = 'Coach',
    Administration = 'Administration',
    Parent = 'Parent',
}

export enum SchoolProgrammeOfInterest {
    SportsSpecificWorkshops = 'Sports specific workshops',
    PhysicalDevelopmentAssessmentAndBoth = 'Physical Development assessment and Both',
}

export enum CorporateRole {
    HrOrPeople = 'Hr or people',
    AdminOrFacilities = 'Admin or Facilities',
    Leadership = 'Leadership',
    Other = 'other',
}

export enum CorporateEngagementModel {
    ProgrammesForOurPeople = 'Programmers for our people',
    RunOurCorporateGym = 'run our corporate gym',
    NotSureYet = 'not sure yet',
}

export enum CorporateEmployeesToBeCovered {
    UnderFifty = 'under 50',
    FiftyToTwoHundred = '50 to 200',
    TwoHundredToFiveHundred = '200 to 500',
    MoreThanFiveHundred = 'More than 500',
}

export enum CorporateGymOnSite {
    YesFullyEquipped = 'Yes fully equipped',
    YesBasic = 'Yes, Basic',
    No = 'No',
}

export enum SocietyRole {
    RwaCommitteeMember = 'RWA committee member',
    FacilityManager = 'Facility manager',
    DeveloperOrBuilder = 'Developer or builder',
    Resident = 'Resident',
}

export enum SocietyExistingGym {
    YesFullyEquipped = 'Yes fully equipped',
    YesBasic = 'Yes, Basic',
    UnderConstruction = 'Under construction',
    No = 'no',
}

export enum SocietyCommercialPreference {
    MonthlyStaffingFee = 'Monthly Staffing Fee',
    RevenueShare = 'Revenue share',
    ResidentPaidModel = 'Resident-paid model',
    OpenToDiscussion = 'Open to discussion',
}

export enum SachinSessionSessionsPerWeek {
    OneSession = '1 Sessions',
    TwoSessions = '2 sessions',
    ThreeSessions = '3 sessions',
    Flexible = 'Flexible',
}

export enum BookingStatus {
    Confirmed = 'confirmed',
    Cancelled = 'cancelled',
}

export enum BookingListFilter {
    All = 'all',
    Upcoming = 'upcomming',
    Past = 'past',
    Cancel = 'cancel',
    Reschedule = 'rechedule',
}
