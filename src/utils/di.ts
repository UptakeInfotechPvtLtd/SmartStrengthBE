import {
    AuthService,
    BranchService,
    CommonService,
    CmsService,
    PackageService,
    SessionService,
    UserService,
} from '../services';

import {
    BranchRepository,
    DbDataSource,
    UserRepository,
    BlackListTokenRepository,
    RoleRepository,
    SessionRepository,
    CmsRepository,
    PackageRepository,
} from './database'; // your file path

export const userRepo = new UserRepository(DbDataSource);
export const roleRepo = new RoleRepository(DbDataSource);
export const blackListTokenRepo = new BlackListTokenRepository(DbDataSource);
export const branchRepo = new BranchRepository(DbDataSource);
export const sessionRepo = new SessionRepository(DbDataSource);
export const packageRepo = new PackageRepository(DbDataSource);
export const cmsRepo = new CmsRepository(DbDataSource);

export const authService = new AuthService(userRepo, roleRepo, branchRepo, blackListTokenRepo);
export const branchService = new BranchService(branchRepo);
export const commonService = new CommonService(roleRepo);
export const sessionService = new SessionService(sessionRepo, branchRepo, userRepo);
export const packageService = new PackageService(packageRepo);
export const userService = new UserService(userRepo, roleRepo, branchRepo);
export const cmsService = new CmsService(cmsRepo);
