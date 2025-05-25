import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';

@Injectable()
export class GqlAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    if (context.getType() === 'http') {
      const request: Request = context.switchToHttp().getRequest();

      return this.validateToken(request);
    } else {
      const ctx = GqlExecutionContext.create(context);
      const request = ctx.getContext()?.req;

      if (!request) {
        throw new UnauthorizedException('GraphQL context request not found');
      }

      return this.validateToken(request);
    }
  }

  private validateToken(request: Request): boolean {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      request.user = decoded;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token verification failed');
    }
  }
}
