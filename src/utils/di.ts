import {
    AuthService,
    BookingService,
    BranchService,
    CommonService,
    CmsService,
    AccessControlService,
    PackageService,
    SessionService,
    AvailabilityManagementService,
    SlotService,
    RosterService,
    EnquiryService,
    UserService,
} from '../services';

import {
    BranchRepository,
    BookingRepository,
    DbDataSource,
    UserRepository,
    BlackListTokenRepository,
    RoleRepository,
    SessionRepository,
    CmsRepository,
    PackageRepository,
    AccessControlRepository,
    AvailabilityManagementRepository,
    SlotRepository,
    RosterRepository,
    EnquiryRepository,
} from './database'; // your file path

export const userRepo = new UserRepository(DbDataSource);
export const roleRepo = new RoleRepository(DbDataSource);
export const blackListTokenRepo = new BlackListTokenRepository(DbDataSource);
export const branchRepo = new BranchRepository(DbDataSource);
export const bookingRepo = new BookingRepository(DbDataSource);
export const sessionRepo = new SessionRepository(DbDataSource);
export const packageRepo = new PackageRepository(DbDataSource);
export const cmsRepo = new CmsRepository(DbDataSource);
export const accessControlRepo = new AccessControlRepository(DbDataSource);
export const availabilityManagementRepo = new AvailabilityManagementRepository(DbDataSource);
export const slotRepo = new SlotRepository(DbDataSource);
export const rosterRepo = new RosterRepository(DbDataSource);
export const enquiryRepo = new EnquiryRepository(DbDataSource);

export const authService = new AuthService(userRepo, roleRepo, branchRepo, blackListTokenRepo);
export const branchService = new BranchService(branchRepo);
export const commonService = new CommonService(roleRepo);
export const sessionService = new SessionService(sessionRepo, branchRepo, userRepo);
export const packageService = new PackageService(packageRepo, userRepo);
export const userService = new UserService(userRepo, roleRepo, branchRepo);
export const cmsService = new CmsService(cmsRepo);
export const accessControlService = new AccessControlService(accessControlRepo, roleRepo, userRepo);
export const availabilityManagementService = new AvailabilityManagementService(
    availabilityManagementRepo,
    branchRepo,
    userRepo,
);
export const slotService = new SlotService(slotRepo);
export const bookingService = new BookingService(bookingRepo, sessionRepo, userRepo, slotService);
export const rosterService = new RosterService(rosterRepo, userRepo);
export const enquiryService = new EnquiryService(enquiryRepo, branchRepo);
