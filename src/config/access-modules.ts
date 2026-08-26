import { AccessModule } from './enum';

export const availableAccessModules = [
    { key: AccessModule.StaffManagement, name: 'Staff Management', sort_order: 1 },
    { key: AccessModule.AccessControl, name: 'Access Control', sort_order: 2 },
    { key: AccessModule.UserManagement, name: 'User Management', sort_order: 3 },
    { key: AccessModule.BranchManagement, name: 'Branch Management', sort_order: 4 },
    { key: AccessModule.BookingManagement, name: 'Booking Management', sort_order: 5 },
    { key: AccessModule.SlotMaintenance, name: 'Slot & Maintenance', sort_order: 6 },
    { key: AccessModule.RosterManagement, name: 'Roster Management', sort_order: 7 },
    { key: AccessModule.TestimonialManagement, name: 'Testimonial Management', sort_order: 8 },
    { key: AccessModule.SingleSessionManagement, name: 'Single Session Management', sort_order: 9 },
    { key: AccessModule.PackageManagement, name: 'Package Management', sort_order: 10 },
    {
        key: AccessModule.TrainWithSachinManagement,
        name: 'Train with Sachin Management',
        sort_order: 11,
    },
    { key: AccessModule.VideoManagement, name: 'Video Management', sort_order: 12 },
    { key: AccessModule.Reports, name: 'Reports', sort_order: 13 },
] as const;
