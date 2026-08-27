import { RoleEntity } from './roles.entity';
import { UserEntity } from './users.entity';
import { BackListTokenEntity } from './back.list.token.entity';
import { BookingEntity } from './booking.entity';
import { BranchEntity } from './branch.entity';
import { UserBranchEntity } from './user-branch.entity';
import { SessionEntity } from './session.entity';
import { SessionBranchEntity } from './session-branch.entity';
import { PackageEntity } from './package.entity';
import { UserPackageEntity } from './user-package.entity';
import { UserPerformanceMetricEntity } from './user-performance-metric.entity';
import { VideoLibraryEntity } from './video-library.entity';
import { AccessModuleEntity } from './access-module.entity';
import { AccessControlEntity } from './access-control.entity';
import { BranchAvailabilitySettingEntity } from './branch-availability-setting.entity';
import { BranchMaintenanceEntity } from './branch-maintenance.entity';
import { TrainerAvailabilityEntity } from './trainer-availability.entity';
import { TrainerMaintenanceEntity } from './trainer-maintenance.entity';
import { TrainerRosterEntity } from './trainer-roster.entity';
import { EnquiryEntity } from './enquiry.entity';
import { TestimonialEntity } from './testimonial.entity';

export const entities = [
    RoleEntity,
    BranchEntity,
    UserBranchEntity,
    SessionEntity,
    SessionBranchEntity,
    PackageEntity,
    UserPackageEntity,
    UserPerformanceMetricEntity,
    VideoLibraryEntity,
    BackListTokenEntity,
    BookingEntity,
    UserEntity,
    AccessModuleEntity,
    AccessControlEntity,
    BranchAvailabilitySettingEntity,
    BranchMaintenanceEntity,
    TrainerAvailabilityEntity,
    TrainerMaintenanceEntity,
    TrainerRosterEntity,
    EnquiryEntity,
    TestimonialEntity,
];

export * from './users.entity';
export * from './roles.entity';
export * from './back.list.token.entity';
export * from './booking.entity';
export * from './branch.entity';
export * from './user-branch.entity';
export * from './session.entity';
export * from './session-branch.entity';
export * from './package.entity';
export * from './user-package.entity';
export * from './user-performance-metric.entity';
export * from './video-library.entity';
export * from './access-module.entity';
export * from './access-control.entity';
export * from './branch-availability-setting.entity';
export * from './branch-maintenance.entity';
export * from './trainer-availability.entity';
export * from './trainer-maintenance.entity';
export * from './trainer-roster.entity';
export * from './enquiry.entity';
export * from './testimonial.entity';
