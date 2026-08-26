import { Brackets, DataSource, Repository } from 'typeorm';
import { FetchEnquiriesQueryPayload } from '../../../../../validations';
import { getOffset } from '../../../../common.utils';
import { handleError } from '../../../../error-handler';
import { EnquiryEntity } from '../../entity';

export class EnquiryRepository extends Repository<EnquiryEntity> {
    constructor(dataSource: DataSource) {
        super(EnquiryEntity, dataSource.createEntityManager());
    }

    async createEnquiry(enquiry: Partial<EnquiryEntity>): Promise<EnquiryEntity> {
        return handleError(async () => {
            const savedEnquiry = await this.save(enquiry);
            return (await this.findEnquiryById(savedEnquiry.id)) || savedEnquiry;
        });
    }

    async findEnquiryById(id?: string): Promise<EnquiryEntity | null> {
        return handleError(() => this.findOne({ where: { id }, relations: { branch: true } }));
    }

    async listEnquiries(query: FetchEnquiriesQueryPayload): Promise<{
        enquiries: EnquiryEntity[];
        total: number;
        page: number;
        pageSize: number;
        offset: number;
    }> {
        return handleError(
            async () => {
                const { page, pageSize, offset, limit } = getOffset(query);
                const queryBuilder = this.createQueryBuilder('enquiry').leftJoinAndSelect(
                    'enquiry.branch',
                    'branch',
                );

                if (query.search) {
                    queryBuilder.andWhere(
                        new Brackets((qb) => {
                            qb.where('enquiry.full_name ILIKE :search', {
                                search: `%${query.search}%`,
                            })
                                .orWhere('enquiry.email ILIKE :search', {
                                    search: `%${query.search}%`,
                                })
                                .orWhere('enquiry.mobile_number ILIKE :search', {
                                    search: `%${query.search}%`,
                                })
                                .orWhere('enquiry.enquiry_type ILIKE :search', {
                                    search: `%${query.search}%`,
                                })
                                .orWhere('branch.branch_name ILIKE :search', {
                                    search: `%${query.search}%`,
                                });
                        }),
                    );
                }

                queryBuilder
                    .orderBy(`enquiry.${query.orderBy || 'created_at'}`, query.order || 'DESC')
                    .addOrderBy('enquiry.id', 'DESC')
                    .skip(offset)
                    .take(limit);

                const [enquiries, total] = await queryBuilder.getManyAndCount();

                return { enquiries, total, page, pageSize, offset };
            },
            {
                enquiries: [],
                total: 0,
                page: Number(query.page) || 1,
                pageSize: Number(query.pageSize) || 10,
                offset: 0,
            },
        );
    }
}
