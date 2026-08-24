import { Brackets, DataSource, Repository } from 'typeorm';
import { FetchVideoLibraryQueryPayload } from '../../../../../validations';
import { Roles, VideoStatus } from '../../../../../config';
import { getOffset } from '../../../../common.utils';
import { handleError } from '../../../../error-handler';
import { VideoLibraryEntity } from '../../entity';

export class CmsRepository extends Repository<VideoLibraryEntity> {
    constructor(dataSource: DataSource) {
        super(VideoLibraryEntity, dataSource.createEntityManager());
    }

    async createVideo(video: Partial<VideoLibraryEntity>): Promise<VideoLibraryEntity> {
        return handleError(() => this.save(video));
    }

    async updateVideo(video: VideoLibraryEntity): Promise<VideoLibraryEntity> {
        return handleError(() => this.save(video));
    }

    async findVideoById(id?: string): Promise<VideoLibraryEntity | null> {
        return handleError(() => this.findOne({ where: { id } }));
    }

    async softDeleteVideo(id?: string): Promise<void> {
        return handleError(async () => {
            await this.createQueryBuilder().softDelete().where('id = :id', { id }).execute();
        });
    }

    async listVideos(
        query: FetchVideoLibraryQueryPayload,
        roleName: Roles,
    ): Promise<{
        videos: VideoLibraryEntity[];
        total: number;
        page: number;
        pageSize: number;
        offset: number;
    }> {
        return handleError(
            async () => {
                const { page, pageSize, offset, limit } = getOffset(query);
                const queryBuilder = this.createQueryBuilder('video');

                if (query.search) {
                    queryBuilder.andWhere(
                        new Brackets((qb) => {
                            qb.where('video.title ILIKE :search', {
                                search: `%${query.search}%`,
                            })
                                .orWhere('video.target_muscle_group ILIKE :search', {
                                    search: `%${query.search}%`,
                                })
                                .orWhere('video.description ILIKE :search', {
                                    search: `%${query.search}%`,
                                })
                                .orWhere('video.guidline ILIKE :search', {
                                    search: `%${query.search}%`,
                                })
                                .orWhere('video.video_source ILIKE :search', {
                                    search: `%${query.search}%`,
                                })
                                .orWhere('video.video_url ILIKE :search', {
                                    search: `%${query.search}%`,
                                });
                        }),
                    );
                }

                if (query.targetMuscleGroup) {
                    queryBuilder.andWhere('video.target_muscle_group ILIKE :targetMuscleGroup', {
                        targetMuscleGroup: `%${query.targetMuscleGroup}%`,
                    });
                }

                if (typeof query.activeMemberOnly === 'boolean') {
                    queryBuilder.andWhere('video.active_member_only = :activeMemberOnly', {
                        activeMemberOnly: query.activeMemberOnly,
                    });
                }

                const canViewInactive = [Roles.Admin, Roles.SubAdmin].includes(roleName);
                if (query.status) {
                    queryBuilder.andWhere('video.status = :status', { status: query.status });
                }

                if (!canViewInactive) {
                    queryBuilder.andWhere('video.status = :activeStatus', {
                        activeStatus: VideoStatus.Active,
                    });
                }

                queryBuilder
                    .orderBy(`video.${query.orderBy || 'created_at'}`, query.order || 'DESC')
                    .skip(offset)
                    .take(limit);

                const [videos, total] = await queryBuilder.getManyAndCount();

                return { videos, total, page, pageSize, offset };
            },
            {
                videos: [],
                total: 0,
                page: Number(query.page) || 1,
                pageSize: Number(query.pageSize) || 10,
                offset: 0,
            },
        );
    }
}
