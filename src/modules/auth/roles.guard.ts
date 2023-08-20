import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { ROLES_KEY } from './role-auth.decorator';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const req = context.switchToHttp().getRequest();

    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new HttpException('User unauthorized', HttpStatus.UNAUTHORIZED);
      }

      const [bearer, token] = authHeader.split(' ');

      if (bearer !== 'Bearer' || !token) {
        throw new HttpException('User unauthorized', HttpStatus.UNAUTHORIZED);
      }

      const user = this.jwtService.verify(token);
      req.user = user;

      if (!requiredRoles.includes(user.role.name)) {
        throw new HttpException('You have not access', HttpStatus.FORBIDDEN);
      }

      return true;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new HttpException('User unauthorized', HttpStatus.UNAUTHORIZED);
      }
      throw new HttpException('You have not access', HttpStatus.FORBIDDEN);
    }
  }
}
