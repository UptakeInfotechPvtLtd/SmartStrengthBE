import { Brackets, DataSource, In, Repository } from 'typeorm';
import { FetchSessionsQueryPayload } from '../../../../../validations';
import { getOffset } from '../../../../common.utils';
import { handleError } from '../../../../error-handler';
import { SessionBranchEntity, SessionEntity } from '../../entity';

export class SessionRepository extends Repository<SessionEntity> {
    constructor(dataSource: DataSource) {
        super(SessionEntity, dataSource.createEntityManager());
    }

    async findSessionById(id: string): Promise<SessionEntity | null> {
        return handleError(() =>
            this.findOne({
                where: { id },
                relations: { sessionBranches: { branch: true } },
            }),
        );
    }

    async createSession(session: Partial<SessionEntity>): Promise<SessionEntity> {
        return handleError(() => this.save(session));
    }

    async updateSession(session: SessionEntity): Promise<SessionEntity> {
        return handleError(() => this.save(session));
    }

    async softDeleteSession(sessionId: string): Promise<void> {
        return handleError(async () => {
            await this.createQueryBuilder()
                .softDelete()
                .where('id = :sessionId', { sessionId })
                .execute();
        });
    }

    async updateSessionBranches(
        session: SessionEntity,
        branchIds: string[],
    ): Promise<SessionEntity> {
        return handleError(async () => {
            await this.manager.delete(SessionBranchEntity, { session: { id: session.id } });
            session.sessionBranches = branchIds.map((branchId) =>
                this.manager.create(SessionBranchEntity, {
                    session,
                    branch: { id: branchId },
                }),
            );
            return this.save(session);
        });
    }

    async listSessions(query: FetchSessionsQueryPayload): Promise<{
        sessions: SessionEntity[];
        total: number;
        page: number;
        pageSize: number;
        offset: number;
    }> {
        return handleError(
            async () => {
                const { page, pageSize, offset, limit } = getOffset(query);
                const queryBuilder = this.createQueryBuilder('session')
                    .leftJoinAndSelect('session.sessionBranches', 'sessionBranches')
                    .leftJoinAndSelect('sessionBranches.branch', 'branch');

                if (query.search) {
                    queryBuilder.andWhere(
                        new Brackets((qb) => {
                            qb.where('session.session_name ILIKE :search', {
                                search: `%${query.search}%`,
                            }).orWhere('session.description ILIKE :search', {
                                search: `%${query.search}%`,
                            });
                        }),
                    );
                }

                const status = this.normalizeStatus(query.status);
                if (typeof status === 'boolean') {
                    queryBuilder.andWhere('session.status = :status', { status });
                }

                if (query.branchId) {
                    queryBuilder.andWhere('branch.id = :branchId', { branchId: query.branchId });
                }

                queryBuilder
                    .orderBy(`session.${query.orderBy || 'created_at'}`, query.order || 'DESC')
                    .skip(offset)
                    .take(limit);

                const [sessions, total] = await queryBuilder.getManyAndCount();

                return { sessions, total, page, pageSize, offset };
            },
            {
                sessions: [],
                total: 0,
                page: Number(query.page) || 1,
                pageSize: Number(query.pageSize) || 10,
                offset: 0,
            },
        );
    }

    createSessionBranches(branchIds: string[]): SessionBranchEntity[] {
        return branchIds.map(
            (branchId) =>
                ({
                    branch: { id: branchId },
                }) as SessionBranchEntity,
        );
    }

    private normalizeStatus(status: unknown): boolean | undefined {
        if (status === true || status === 'true') return true;
        if (status === false || status === 'false') return false;
        return undefined;
    }
}
