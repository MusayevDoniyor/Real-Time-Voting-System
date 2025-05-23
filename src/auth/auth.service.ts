import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register-user.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { IJwtPayload } from 'src/common/strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (existingUser)
      throw new ConflictException(
        `User already exists with this email: ${dto.email}`,
      );

    const user = this.userRepo.create(dto);

    await this.userRepo.save(user);

    return {
      message: 'User registered successfully',
      user,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user)
      throw new UnauthorizedException('Invalid credentials. User not found');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch)
      throw new UnauthorizedException(
        'Invalid credentials. Incorrect password',
      );

    const payload: IJwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '6h',
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async getProfile(id: string) {
    const user = await this.userRepo.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'created_at', 'role'],
    });
    if (!user)
      throw new UnauthorizedException('Invalid credentials. User not found');

    return user;
  }
}
