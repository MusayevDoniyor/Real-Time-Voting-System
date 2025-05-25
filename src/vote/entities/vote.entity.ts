import { ObjectType, Field } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Poll } from '../../pool/entities/poll.entity';
import { User } from 'src/auth/entities/user.entity';
import { IsNotEmpty } from 'class-validator';

@ObjectType()
@Entity('votes')
@Unique(['user', 'poll'])
export class Vote {
  @Field(() => String, { description: 'Vote ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.votes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field(() => Poll)
  @ManyToOne(() => Poll, (poll) => poll.votes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'poll_id' })
  poll: Poll;

  @Field(() => String, { description: 'Selected poll option' })
  @Column({ nullable: false })
  @IsNotEmpty()
  selectedOption: string;

  @Field(() => Date, { description: 'Vote created at' })
  @CreateDateColumn()
  createdAt: Date;
}
