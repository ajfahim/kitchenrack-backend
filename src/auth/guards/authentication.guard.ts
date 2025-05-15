import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    try {
      const access_token = request.cookies['access_token'];

      if (!access_token) {
        throw new UnauthorizedException("You're not logged in");
      }

      const data = await this.jwtService.verifyAsync(access_token);
      console.log('🚀 ~ AuthenticationGuard ~ data:', data);
      request['user'] = data.payload;
      return true;
    } catch (err) {
      console.log(err);
      throw new UnauthorizedException();
    }
  }
}
