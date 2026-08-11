import { AuthService, BranchService, CommonService, UserService } from '../services';

import {
    BranchRepository,
    DbDataSource,
    UserRepository,
    BlackListTokenRepository,
    RoleRepository,
} from './database'; // your file path

export const userRepo = new UserRepository(DbDataSource);
export const roleRepo = new RoleRepository(DbDataSource);
export const blackListTokenRepo = new BlackListTokenRepository(DbDataSource);
export const branchRepo = new BranchRepository(DbDataSource);

export const authService = new AuthService(userRepo, roleRepo, blackListTokenRepo);
export const branchService = new BranchService(branchRepo);
export const commonService = new CommonService(roleRepo);
export const userService = new UserService(userRepo, roleRepo, branchRepo);
