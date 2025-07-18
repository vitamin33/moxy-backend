import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    try {
      const authHeader = req.headers.authorization;
      const bearer = authHeader.split(' ')[0];
      const token = authHeader.split(' ')[1];
      if (bearer !== 'Bearer' || !token) {
        throw new UnauthorizedException({ message: 'User unauthorized' });
      }
      const user = this.jwtService.verify(token);

      if (user.isGuest) {
        req.user = { id: user.id, role: { name: 'GUEST' }, isGuest: true };
        req.guestId = user.id;
        return true;
      }

      req.user = user;
      req.userId = user.id;

      return true;
    } catch (error) {
      throw new UnauthorizedException({ message: 'User unauthorized' });
    }
  }
}
