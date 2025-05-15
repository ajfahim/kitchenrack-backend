import { Response } from 'express';
import { TApiResponse } from '../types/apiResponse';

const sendResponse = <T>(
  res: Response,
  data: TApiResponse<T>,
  cookies?: Record<string, string>,
): TApiResponse<T> => {
  if (cookies) {
    Object.entries(cookies).forEach(([key, value]) =>
      res.cookie(key, value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        path: '/',
        domain: process.env.COOKIE_DOMAIN || undefined, // Add this
        maxAge: key.includes('refresh')
          ? 7 * 24 * 60 * 60 * 1000
          : 24 * 60 * 60 * 1000, // 7 days for refresh, 1 day for access
      }),
    );
  }

  const response: TApiResponse<T> = {
    success: data.success,
    statusCode: data.statusCode,
    message: data.message,
    meta: data.meta,
    data: data.data,
  };

  res.status(data.statusCode).json(response);

  return response;
};

export default sendResponse;
