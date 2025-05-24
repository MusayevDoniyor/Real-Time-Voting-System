import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const requiredRoles: string[] =
      this.reflector.get<string[]>('roles', ctx.getHandler()) || [];

    if (requiredRoles.length === 0) return true;

    const user: User = ctx.getContext().req.user;
    if (!user) {
      throw new ForbiddenException('User not found. Please log in.');
    }

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied! You need one of these roles: ${requiredRoles.join(', ')}.`,
      );
    }

    return true;
  }
}
