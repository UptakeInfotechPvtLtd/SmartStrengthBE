import { RoleEntity } from './roles.entity';
import { UserEntity } from './users.entity';
import { BackListTokenEntity } from './back.list.token.entity';
import { BranchEntity } from './branch.entity';
import { UserBranchEntity } from './user-branch.entity';

export const entities = [
    RoleEntity,
    BranchEntity,
    UserBranchEntity,
    BackListTokenEntity,
    UserEntity,
];

export * from './users.entity';
export * from './roles.entity';
export * from './back.list.token.entity';
export * from './branch.entity';
export * from './user-branch.entity';
