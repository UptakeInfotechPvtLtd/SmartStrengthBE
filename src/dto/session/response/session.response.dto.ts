import { IPaginationMeta } from '../../../config';
import { SessionEntity } from '../../../utils';
import { BranchResponseDto } from '../../branch';

export class SessionResponseDto {
    id!: string;
    sessionName!: string;
    price!: number;
    duration!: number;
    description!: string | null;
    branches!: BranchResponseDto[];
    status!: boolean;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(session?: SessionEntity) {
        this.id = session?.id || '';
        this.sessionName = session?.session_name || '';
        this.price = Number(session?.price || 0);
        this.duration = session?.duration || 0;
        this.description = session?.description || null;
        this.branches =
            session?.sessionBranches
                ?.map((sessionBranch) =>
                    sessionBranch?.branch ? new BranchResponseDto(sessionBranch?.branch) : null,
                )
                .filter((branch): branch is BranchResponseDto => Boolean(branch)) || [];
        this.status = session?.status || false;
        this.createdAt = session?.created_at!;
        this.updatedAt = session?.updated_at!;
    }
}

export class SessionListResponseDto {
    results!: SessionResponseDto[];
    pagination!: IPaginationMeta;

    constructor(sessions: SessionEntity[], pagination: IPaginationMeta) {
        this.results = sessions.map((session) => new SessionResponseDto(session));
        this.pagination = pagination;
    }
}
