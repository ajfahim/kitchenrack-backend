import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    try {
      const access_token = request.cookies['access_token'];

      if (!access_token) {
        throw new UnauthorizedException();
      }

      const data = this.jwtService.verify(access_token);
      request.user = data.payload;
      return true;
    } catch (err) {
      console.log(err);
      throw new UnauthorizedException();
    }
  }
}
