import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    if (context.getType() === 'http') {
      const request: Request = context.switchToHttp().getRequest();

      return this.validateToken(request);
    } else {
      const ctx = GqlExecutionContext.create(context);
      const request = ctx.getContext().req;
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
      console.log('Token verification failed:', error.message);
      return false;
    }
  }
}
