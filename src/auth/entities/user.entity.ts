import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

export enum UserRoles {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({
    type: 'enum',
    enumName: 'UserRoles',
    enum: UserRoles,
    default: UserRoles.USER,
  })
  role: UserRoles;

  @CreateDateColumn()
  created_at: Date;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 12);
  }
}
