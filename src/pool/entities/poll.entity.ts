import { ObjectType, Field } from '@nestjs/graphql';
import { User } from 'src/auth/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Vote } from '../../vote/entities/vote.entity';

@ObjectType()
@Entity('polls')
export class Poll {
  @Field(() => String, { description: 'Poll ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String, { description: 'Poll question' })
  @Column({ nullable: false })
  question: string;

  @Field(() => [String], { description: 'Poll options' })
  @Column({ type: 'jsonb', nullable: false })
  options: string[];

  @Field(() => Boolean, { description: 'Is poll active' })
  @Column({ default: true })
  is_active: boolean;

  @Field(() => Date, { description: 'Poll created at' })
  @CreateDateColumn()
  created_at: Date;

  @Field(() => User, { nullable: false, description: 'Poll creator' })
  @ManyToOne(() => User, (user) => user.pollsCreated, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  created_by: User;

  @Field(() => [Vote], { description: 'Votes for the poll' })
  @OneToMany(() => Vote, (vote) => vote.poll)
  votes: Vote[];
}
