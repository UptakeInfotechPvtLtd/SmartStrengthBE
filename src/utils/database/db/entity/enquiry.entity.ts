import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { EnquiryType } from '../../../../config/enum';
import { BranchEntity } from './branch.entity';

@Entity('Enquiries')
@Index('IDX_enquiries_email', ['email'])
@Index('IDX_enquiries_type', ['enquiry_type'])
@Index('IDX_enquiries_branch_id', ['branch'])
@Index('IDX_enquiries_deleted_at', ['deleted_at'])
@Index('IDX_enquiries_created_at', ['created_at'])
export class EnquiryEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 80 })
    enquiry_type!: EnquiryType;

    @Column({ type: 'varchar', length: 150 })
    full_name!: string;

    @Column({ type: 'varchar', length: 255 })
    email!: string;

    @Column({ type: 'varchar', length: 20 })
    mobile_number!: string;

    @ManyToOne(() => BranchEntity, (branch) => branch.enquiries, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'branch_id' })
    branch!: BranchEntity;

    @Column({ type: 'jsonb' })
    details!: Record<string, string | number>;

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at!: Date;

    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deleted_at!: Date | null;
}
