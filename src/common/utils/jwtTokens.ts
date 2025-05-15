import { JwtService } from '@nestjs/jwt';

type generateTokenPayload = {
  payload: { id: number; phone: string; full_name: string; role: string };
  options: { expiresIn: string };
};
export const generateToken = async (
  jwtService: JwtService,
  payload: generateTokenPayload,
) => {
  const token = await jwtService.sign(payload);
  return token;
};

export const verifyToken = async (jwtService: JwtService, token: string) => {
  return jwtService.verify(token);
};

export const decodeToken = async (jwtService: JwtService, token: string) => {
  return jwtService.decode(token);
};
