import { Brackets, DataSource, EntityManager, Repository } from 'typeorm';
import { BookingListFilter, BookingStatus } from '../../../../../config/enum';
import { FetchBookingsQueryPayload } from '../../../../../validations';
import { getOffset } from '../../../../common.utils';
import { handleError } from '../../../../error-handler';
import { BookingEntity, UserPackageEntity } from '../../entity';

export class BookingRepository extends Repository<BookingEntity> {
    constructor(private readonly dataSource: DataSource) {
        super(BookingEntity, dataSource.createEntityManager());
    }

    async transaction<T>(operation: (manager: EntityManager) => Promise<T>): Promise<T> {
        return this.dataSource.transaction(operation);
    }

    async lockSlot(manager: EntityManager, lockKey: string): Promise<void> {
        await manager.query(`SELECT pg_advisory_xact_lock(hashtext($1))`, [lockKey]);
    }

    async createBooking(
        manager: EntityManager,
        booking: Partial<BookingEntity>,
    ): Promise<BookingEntity> {
        const savedBooking = await manager.save(BookingEntity, booking);
        return (
            (await manager.findOne(BookingEntity, {
                where: { id: savedBooking.id },
                relations: {
                    user: true,
                    session: true,
                    branch: true,
                    trainer: true,
                    userPackage: true,
                },
            })) || savedBooking
        );
    }

    async findBookingByIdForUserWithLock(
        manager: EntityManager,
        bookingId: string,
        userId: string,
    ): Promise<BookingEntity | null> {
        return manager
            .getRepository(BookingEntity)
            .createQueryBuilder('booking')
            .setLock('pessimistic_write', undefined, ['booking'])
            .leftJoinAndSelect('booking.user', 'user')
            .leftJoinAndSelect('booking.session', 'session')
            .leftJoinAndSelect('booking.branch', 'branch')
            .leftJoinAndSelect('booking.trainer', 'trainer')
            .leftJoinAndSelect('booking.userPackage', 'userPackage')
            .where('booking.id = :bookingId', { bookingId })
            .andWhere('user.id = :userId', { userId })
            .getOne();
    }

    async findBookingByIdWithLock(
        manager: EntityManager,
        bookingId: string,
    ): Promise<BookingEntity | null> {
        return manager
            .getRepository(BookingEntity)
            .createQueryBuilder('booking')
            .setLock('pessimistic_write', undefined, ['booking'])
            .leftJoinAndSelect('booking.user', 'user')
            .leftJoinAndSelect('booking.session', 'session')
            .leftJoinAndSelect('booking.branch', 'branch')
            .leftJoinAndSelect('booking.trainer', 'trainer')
            .leftJoinAndSelect('booking.userPackage', 'userPackage')
            .where('booking.id = :bookingId', { bookingId })
            .getOne();
    }

    async updateBooking(manager: EntityManager, booking: BookingEntity): Promise<BookingEntity> {
        const savedBooking = await manager.save(BookingEntity, booking);
        return (
            (await manager.findOne(BookingEntity, {
                where: { id: savedBooking.id },
                relations: {
                    user: true,
                    session: true,
                    branch: true,
                    trainer: true,
                    userPackage: true,
                },
            })) || savedBooking
        );
    }

    async countUserCancellationsForYear(
        manager: EntityManager,
        userId: string,
        yearStart: Date,
        yearEnd: Date,
    ): Promise<number> {
        return manager
            .getRepository(BookingEntity)
            .createQueryBuilder('booking')
            .leftJoin('booking.user', 'user')
            .where('user.id = :userId', { userId })
            .andWhere('booking.status = :status', { status: BookingStatus.Cancelled })
            .andWhere('booking.cancelled_at >= :yearStart', { yearStart })
            .andWhere('booking.cancelled_at < :yearEnd', { yearEnd })
            .getCount();
    }

    async hasUserBookingOverlapWithLock(
        manager: EntityManager,
        userId: string,
        date: string,
        startTime: string,
        endTime: string,
    ): Promise<boolean> {
        const rows = await manager
            .getRepository(BookingEntity)
            .createQueryBuilder('booking')
            .setLock('pessimistic_write')
            .where('booking.user_id = :userId', { userId })
            .andWhere('booking.booking_date = :date', { date })
            .andWhere('booking.start_time < :endTime', { endTime })
            .andWhere('booking.end_time > :startTime', { startTime })
            .andWhere('booking.status = :status', { status: BookingStatus.Confirmed })
            .getMany();

        return rows.length > 0;
    }

    async findOwnedPackageWithLock(
        manager: EntityManager,
        userId: string,
        packageId: string,
    ): Promise<UserPackageEntity | null> {
        return manager
            .getRepository(UserPackageEntity)
            .createQueryBuilder('user_package')
            .setLock('pessimistic_write', undefined, ['user_package'])
            .leftJoinAndSelect('user_package.user', 'user')
            .leftJoinAndSelect('user_package.package', 'package')
            .where('user.id = :userId', { userId })
            .andWhere('package.id = :packageId', { packageId })
            .andWhere('user_package.deleted_at IS NULL')
            .orderBy('user_package.expired_at', 'ASC')
            .addOrderBy('user_package.created_at', 'ASC')
            .getOne();
    }

    async updateUserPackage(
        manager: EntityManager,
        userPackage: UserPackageEntity,
    ): Promise<UserPackageEntity> {
        return manager.save(UserPackageEntity, userPackage);
    }

    async listBookings(
        query: FetchBookingsQueryPayload,
        assignedBranchIds?: string[],
    ): Promise<{
        bookings: BookingEntity[];
        total: number;
        page: number;
        pageSize: number;
        offset: number;
    }> {
        return handleError(
            async () => {
                const { page, pageSize, offset, limit } = getOffset(query);
                const queryBuilder = this.createQueryBuilder('booking')
                    .leftJoinAndSelect('booking.user', 'user')
                    .leftJoinAndSelect('booking.session', 'session')
                    .leftJoinAndSelect('booking.branch', 'branch')
                    .leftJoinAndSelect('booking.trainer', 'trainer')
                    .leftJoinAndSelect('booking.userPackage', 'userPackage');

                if (assignedBranchIds !== undefined) {
                    if (assignedBranchIds.length === 0) {
                        queryBuilder.andWhere('1 = 0');
                    } else {
                        queryBuilder.andWhere('branch.id IN (:...assignedBranchIds)', {
                            assignedBranchIds,
                        });
                    }
                }

                if (query.search) {
                    queryBuilder.andWhere(
                        new Brackets((qb) => {
                            qb.where('user.full_name ILIKE :search', {
                                search: `%${query.search}%`,
                            })
                                .orWhere('user.email ILIKE :search', {
                                    search: `%${query.search}%`,
                                })
                                .orWhere('session.session_name ILIKE :search', {
                                    search: `%${query.search}%`,
                                })
                                .orWhere('branch.branch_name ILIKE :search', {
                                    search: `%${query.search}%`,
                                });
                        }),
                    );
                }

                if (query.userId)
                    queryBuilder.andWhere('user.id = :userId', { userId: query.userId });
                if (query.sessionId) {
                    queryBuilder.andWhere('session.id = :sessionId', {
                        sessionId: query.sessionId,
                    });
                }
                if (query.date)
                    queryBuilder.andWhere('booking.booking_date = :date', { date: query.date });

                if (query.status === BookingListFilter.Upcoming) {
                    queryBuilder
                        .andWhere('booking.status = :bookingStatus', {
                            bookingStatus: BookingStatus.Confirmed,
                        })
                        .andWhere('(booking.booking_date + booking.start_time) > NOW()');
                }

                if (query.status === BookingListFilter.Past) {
                    queryBuilder
                        .andWhere('booking.status = :bookingStatus', {
                            bookingStatus: BookingStatus.Confirmed,
                        })
                        .andWhere('(booking.booking_date + booking.end_time) < NOW()');
                }

                if (query.status === BookingListFilter.Cancel) {
                    queryBuilder.andWhere('booking.status = :bookingStatus', {
                        bookingStatus: BookingStatus.Cancelled,
                    });
                }

                if (query.status === BookingListFilter.Reschedule) {
                    queryBuilder
                        .andWhere('booking.rescheduled_at IS NOT NULL')
                        .andWhere('booking.status != :cancelledStatus', {
                            cancelledStatus: BookingStatus.Cancelled,
                        });
                }

                queryBuilder
                    .orderBy(`booking.${query.orderBy || 'created_at'}`, query.order || 'DESC')
                    .addOrderBy('booking.id', 'DESC')
                    .skip(offset)
                    .take(limit);

                const [bookings, total] = await queryBuilder.getManyAndCount();
                return { bookings, total, page, pageSize, offset };
            },
            {
                bookings: [],
                total: 0,
                page: Number(query.page) || 1,
                pageSize: Number(query.pageSize) || 10,
                offset: 0,
            },
        );
    }
}
