import { DbDataSource } from '../connection';
import * as bcrypt from 'bcryptjs';
import { BranchEntity, RoleEntity, UserEntity } from '../entity';
import { Gender, Roles, UserType } from '../../../../config';

export async function seedUsers() {
    const roleRepo = DbDataSource.getRepository(RoleEntity);
    const branchRepo = DbDataSource.getRepository(BranchEntity);
    const userRepo = DbDataSource.getRepository(UserEntity);

    const branchOne = await branchRepo.findOne({ where: { name: 'Ahmedabad Main Branch' } });
    const branchTwo = await branchRepo.findOne({ where: { name: 'Surat Training Branch' } });
    const allBranches = [branchOne, branchTwo].filter(Boolean) as BranchEntity[];

    const users = [
        {
            full_name: 'Admin User',
            phone_no: null,
            email: 'admin@yopmail.com',
            password: 'Test@1234',
            role_name: Roles.Admin,
            branchIds: [],
            age: null,
            gender: null,
            user_type: null,
            performance_metrics: null,
        },
        {
            full_name: 'Sub Admin User',
            phone_no: '9876543220',
            email: 'subadmin@yopmail.com',
            password: 'Test@1234',
            role_name: Roles.SubAdmin,
            branchIds: allBranches.map((branch) => branch.id),
            age: null,
            gender: null,
            user_type: null,
            performance_metrics: null,
        },
        {
            full_name: 'Trainer User',
            phone_no: '9876543221',
            email: 'trainer@yopmail.com',
            password: 'Test@1234',
            role_name: Roles.Trainer,
            branchIds: allBranches.map((branch) => branch.id),
            age: null,
            gender: null,
            user_type: null,
            performance_metrics: null,
        },
        {
            full_name: 'Normal User',
            phone_no: '9876543222',
            email: 'user@yopmail.com',
            password: 'Test@1234',
            role_name: Roles.User,
            branchIds: branchOne ? [branchOne.id] : [],
            age: 18,
            gender: Gender.Male,
            user_type: UserType.Student,
            performance_metrics: {
                sprintTime30m: '4.5 sec',
                verticalJump: '50 cm',
                gripStrength: '40 kg',
                vo2MaxEstimate: '45 ml/kg/min',
                bodyFatPercentage: '15%',
            },
        },
    ];

    for (const user of users) {
        const exists = await userRepo.findOne({ where: { email: user.email } });
        if (exists) {
            console.log(`User already exists: ${user.email}`);
            continue;
        }

        const role = await roleRepo.findOne({ where: { name: user.role_name } });
        if (!role) {
            console.log(`Role not found for user: ${user.email}, skipping`);
            continue;
        }

        await userRepo.save({
            full_name: user.full_name,
            phone_no: user.phone_no,
            email: user.email,
            password: await bcrypt.hash(user.password, 10),
            age: user.age,
            gender: user.gender,
            user_type: user.user_type,
            performance_metrics: user.performance_metrics,
            status: true,
            is_email_verified: true,
            is_terms_agreed: user.role_name === Roles.User,
            role,
            userBranches: user.branchIds.map((branchId) => ({
                branch: { id: branchId },
            })),
        });
        console.log(`User created: ${user.email}`);
    }

    console.log('User seeding completed');
}
