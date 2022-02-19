import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('reply')
export class Reply {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('integer')
  article_id: number;

  @Column({ type: 'integer', nullable: true })
  reply_ref: number;

  @Column({ type: 'varchar', default: '' })
  content: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;
}
