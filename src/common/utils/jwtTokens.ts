import { JwtService } from '@nestjs/jwt';

type generateTokenPayload = {
  payload: { id: string; phone: string; name: string; role: string };
  options: { expiresIn: string };
};
export const generateToken = async (
  jwtService: JwtService,
  payload: generateTokenPayload,
) => {
  return jwtService.sign(payload);
};
