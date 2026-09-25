import { AuthService } from '../services/auth.services';
import { BookingService } from '../services/booking.services';
import { BranchService } from '../services/branch.services';
import { CommonService } from '../services/common.services';
import { CmsService } from '../services/cms.services';
import { AccessControlService } from '../services/access-control.services';
import { PackageService } from '../services/package.services';
import { SessionService } from '../services/session.services';
import { AvailabilityManagementService } from '../services/availability-management.services';
import { SlotService } from '../services/slot.services';
import { RosterService } from '../services/roster.services';
import { EnquiryService } from '../services/enquiry.services';
import { UserService } from '../services/user.services';
import { TestimonialService } from '../services/testimonial.services';

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
    TestimonialRepository,
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
export const testimonialRepo = new TestimonialRepository(DbDataSource);

export let authService: AuthService;
export let branchService: BranchService;
export let commonService: CommonService;
export let sessionService: SessionService;
export let packageService: PackageService;
export let userService: UserService;
export let cmsService: CmsService;
export let accessControlService: AccessControlService;
export let availabilityManagementService: AvailabilityManagementService;
export let slotService: SlotService;
export let bookingService: BookingService;
export let rosterService: RosterService;
export let enquiryService: EnquiryService;
export let testimonialService: TestimonialService;

export const initServices = () => {
    if (!authService && AuthService)
        authService = new AuthService(userRepo, roleRepo, branchRepo, blackListTokenRepo);
    if (!branchService && BranchService) branchService = new BranchService(branchRepo);
    if (!commonService && CommonService) commonService = new CommonService(roleRepo);
    if (!sessionService && SessionService)
        sessionService = new SessionService(sessionRepo, branchRepo, userRepo);
    if (!packageService && PackageService)
        packageService = new PackageService(packageRepo, userRepo);
    if (!userService && UserService) userService = new UserService(userRepo, roleRepo, branchRepo);
    if (!cmsService && CmsService) cmsService = new CmsService(cmsRepo);
    if (!accessControlService && AccessControlService)
        accessControlService = new AccessControlService(accessControlRepo, roleRepo, userRepo);
    if (!availabilityManagementService && AvailabilityManagementService)
        availabilityManagementService = new AvailabilityManagementService(
            availabilityManagementRepo,
            branchRepo,
            userRepo,
        );
    if (!slotService && SlotService) slotService = new SlotService(slotRepo);
    if (!bookingService && BookingService)
        bookingService = new BookingService(
            bookingRepo,
            sessionRepo,
            branchRepo,
            userRepo,
            slotService,
        );
    if (!rosterService && RosterService) rosterService = new RosterService(rosterRepo, userRepo);
    if (!enquiryService && EnquiryService)
        enquiryService = new EnquiryService(enquiryRepo, branchRepo);
    if (!testimonialService && TestimonialService)
        testimonialService = new TestimonialService(testimonialRepo, userRepo);
};

try {
    initServices();
} catch {
    // Ignore if module evaluation is in progress
}
