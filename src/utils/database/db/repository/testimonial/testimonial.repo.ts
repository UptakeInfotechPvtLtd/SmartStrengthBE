import { Brackets, DataSource, Repository } from 'typeorm';
import { TestimonialStatus } from '../../../../../config';
import { FetchTestimonialsQueryPayload } from '../../../../../validations';
import { getOffset } from '../../../../common.utils';
import { handleError } from '../../../../error-handler';
import { TestimonialEntity } from '../../entity';

export class TestimonialRepository extends Repository<TestimonialEntity> {
    constructor(dataSource: DataSource) {
        super(TestimonialEntity, dataSource.createEntityManager());
    }

    async createTestimonial(
        testimonial: Partial<TestimonialEntity>,
    ): Promise<TestimonialEntity> {
        return handleError(async () => {
            const savedTestimonial = await this.save(testimonial);
            return (await this.findTestimonialById(savedTestimonial.id)) || savedTestimonial;
        });
    }

    async updateTestimonial(testimonial: TestimonialEntity): Promise<TestimonialEntity> {
        return handleError(async () => {
            const savedTestimonial = await this.save(testimonial);
            return (await this.findTestimonialById(savedTestimonial.id)) || savedTestimonial;
        });
    }

    async findTestimonialById(id?: string): Promise<TestimonialEntity | null> {
        return handleError(() =>
            this.findOne({ where: { id }, relations: { user: { role: true } } }),
        );
    }

    async softDeleteTestimonial(id?: string): Promise<void> {
        return handleError(async () => {
            await this.createQueryBuilder().softDelete().where('id = :id', { id }).execute();
        });
    }

    async listTestimonials(
        query: FetchTestimonialsQueryPayload,
        approvedOnly = false,
    ): Promise<{
        testimonials: TestimonialEntity[];
        total: number;
        page: number;
        pageSize: number;
        offset: number;
    }> {
        return handleError(
            async () => {
                const { page, pageSize, offset, limit } = getOffset(query);
                const queryBuilder = this.createQueryBuilder('testimonial').leftJoinAndSelect(
                    'testimonial.user',
                    'user',
                );

                if (query.search) {
                    queryBuilder.andWhere(
                        new Brackets((qb) => {
                            qb.where('testimonial.experience ILIKE :search', {
                                search: `%${query.search}%`,
                            })
                                .orWhere('user.full_name ILIKE :search', {
                                    search: `%${query.search}%`,
                                })
                                .orWhere('user.email ILIKE :search', {
                                    search: `%${query.search}%`,
                                });
                        }),
                    );
                }

                if (approvedOnly) {
                    queryBuilder.andWhere('testimonial.status = :approvedStatus', {
                        approvedStatus: TestimonialStatus.Approved,
                    });
                } else if (query.status) {
                    queryBuilder.andWhere('testimonial.status = :status', { status: query.status });
                }

                queryBuilder
                    .orderBy(
                        `testimonial.${query.orderBy || 'created_at'}`,
                        query.order || 'DESC',
                    )
                    .addOrderBy('testimonial.id', 'DESC')
                    .skip(offset)
                    .take(limit);

                const [testimonials, total] = await queryBuilder.getManyAndCount();

                return { testimonials, total, page, pageSize, offset };
            },
            {
                testimonials: [],
                total: 0,
                page: Number(query.page) || 1,
                pageSize: Number(query.pageSize) || 10,
                offset: 0,
            },
        );
    }
}
