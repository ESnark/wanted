import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('keyword')
export class Keyword {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  writer: string;

  @Column('varchar')
  content: string;
}
