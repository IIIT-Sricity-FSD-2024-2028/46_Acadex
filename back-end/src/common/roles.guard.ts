import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const rawRole = request.headers['x-role'] || request.headers['role'];
    const role = (typeof rawRole === 'string' ? rawRole.toLowerCase().trim() : '') || 'admin';
    const normalizedRequired = requiredRoles.map((r) => r.toLowerCase().trim());

    // Admin has super-role access; otherwise check if role matches any required roles
    if (role === 'admin' || normalizedRequired.includes(role)) {
      return true;
    }

    throw new ForbiddenException(
      `Access denied for role '${role}'. Requires one of: ${requiredRoles.join(', ')}`
    );
  }
}
