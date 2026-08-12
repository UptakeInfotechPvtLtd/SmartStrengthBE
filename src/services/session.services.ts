import { IJwtPayload, Roles } from '../config';
import { SessionListResponseDto, SessionResponseDto } from '../dto';
import { messages } from '../lang/api-messages';
import {
    BadRequestException,
    BranchEntity,
    BranchRepository,
    NotFoundException,
    SessionBranchEntity,
    SessionRepository,
    UserRepository,
    buildPagination,
} from '../utils';
import {
    CreateSessionBodyPayload,
    FetchSessionsQueryPayload,
    SessionIdParamsPayload,
    UpdateSessionBodyPayload,
    UpdateSessionStatusBodyPayload,
} from '../validations';

export class SessionService {
    constructor(
        private readonly sessionRepo: SessionRepository,
        private readonly branchRepo: BranchRepository,
        private readonly userRepo: UserRepository,
    ) {}

    async createSession(
        body: CreateSessionBodyPayload,
        authUser: IJwtPayload,
    ): Promise<SessionResponseDto> {
        await this.ensureBranchesAllowed(body.branchIds, authUser);

        const session = await this.sessionRepo.createSession({
            session_name: body.sessionName,
            price: body.price.toFixed(2),
            duration: body.duration,
            description: body.description || null,
            status: body.status ?? true,
            sessionBranches: this.createSessionBranches(body.branchIds),
        });

        return new SessionResponseDto(
            (await this.sessionRepo.findSessionById(session?.id)) || session,
        );
    }

    async updateSession(
        params: SessionIdParamsPayload,
        body: UpdateSessionBodyPayload,
        authUser: IJwtPayload,
    ): Promise<SessionResponseDto> {
        const session = await this.getSession(params?.id);
        if (body.branchIds) {
            await this.ensureBranchesAllowed(body.branchIds, authUser);
        }

        if (body.sessionName !== undefined) session.session_name = body.sessionName;
        if (body.price !== undefined) session.price = body.price.toFixed(2);
        if (body.duration !== undefined) session.duration = body.duration;
        if (body.description !== undefined) session.description = body.description;
        if (body.status !== undefined) session.status = body.status;

        const updatedSession = await this.sessionRepo.updateSession(session);
        if (body.branchIds) {
            await this.sessionRepo.updateSessionBranches(updatedSession, body.branchIds);
        }

        return new SessionResponseDto(
            (await this.sessionRepo.findSessionById(updatedSession?.id)) || updatedSession,
        );
    }

    async updateSessionStatus(
        params: SessionIdParamsPayload,
        body: UpdateSessionStatusBodyPayload,
    ): Promise<SessionResponseDto> {
        const session = await this.getSession(params?.id);
        session.status = body.status;

        return new SessionResponseDto(await this.sessionRepo.updateSession(session));
    }

    async deleteSession(params: SessionIdParamsPayload): Promise<void> {
        const session = await this.getSession(params?.id);
        await this.sessionRepo.softDeleteSession(session?.id);
    }

    async getSessionById(params: SessionIdParamsPayload): Promise<SessionResponseDto> {
        return new SessionResponseDto(await this.getSession(params?.id));
    }

    async listSessions(query: FetchSessionsQueryPayload): Promise<SessionListResponseDto> {
        const { sessions, total, page, pageSize, offset } =
            await this.sessionRepo.listSessions(query);

        return new SessionListResponseDto(
            sessions,
            buildPagination({ totalResults: total, page, pageSize, offset }),
        );
    }

    private async getSession(id?: string): Promise<SessionEntityLike> {
        const session = await this.sessionRepo.findSessionById(id);
        if (!session) {
            throw new NotFoundException(messages.sessionNotFound);
        }

        return session;
    }

    private async ensureBranchesAllowed(branchIds: string[], authUser: IJwtPayload): Promise<void> {
        const branches = await this.branchRepo.findActiveBranchesByIds(branchIds);
        if (branches.length !== new Set(branchIds).size) {
            throw new BadRequestException(messages.invalidBranchIds);
        }

        if (authUser?.roleName !== Roles.SubAdmin) {
            return;
        }

        const assignedBranchIds = await this.userRepo.findAssignedBranchIds(authUser?.userId);
        const hasUnauthorizedBranch = branchIds.some(
            (branchId) => !assignedBranchIds.includes(branchId),
        );

        if (hasUnauthorizedBranch) {
            throw new BadRequestException(messages.sessionBranchNotAssignedToSubAdmin);
        }
    }

    private createSessionBranches(branchIds: string[]): SessionBranchEntity[] {
        return branchIds.map(
            (branchId) =>
                ({
                    branch: { id: branchId } as BranchEntity,
                }) as SessionBranchEntity,
        );
    }
}

type SessionEntityLike =
    Awaited<ReturnType<SessionRepository['findSessionById']>> extends infer T
        ? NonNullable<T>
        : never;
