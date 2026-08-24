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
    TestimonialManagement = 'testimonial_management',
    SingleSessionManagement = 'single_session_management',
    PackageManagement = 'package_management',
    TrainWithSachinManagement = 'train_with_sachin_management',
    VideoManagement = 'video_management',
    Reports = 'reports',
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
    Published = 'published',
    Draft = 'draft',
}
