import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Poll } from 'src/pool/entities/poll.entity';
import { Vote } from 'src/pool/entities/vote.entity';

export enum UserRoles {
  ADMIN = 'admin',
  USER = 'user',
}

@ObjectType()
@Entity('users')
export class User {
  @Field(() => String, { description: 'User ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String, { description: 'User name' })
  @Column({ nullable: false })
  name: string;

  @Field(() => String, { description: 'User email' })
  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Field(() => String, { description: 'User role' })
  @Column({
    type: 'enum',
    enumName: 'UserRoles',
    enum: UserRoles,
    default: UserRoles.USER,
  })
  role: UserRoles;

  @Field(() => String, { description: 'User registered at' })
  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Poll, (poll) => poll.created_by)
  pollsCreated: Poll[];

  @OneToMany(() => Vote, (vote) => vote.user)
  votes: Vote[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }
}
