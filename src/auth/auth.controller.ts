import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { TApiResponse } from 'src/common/types/apiResponse';
import sendResponse from 'src/common/utils/sendResponse';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegistrationDto } from './dto/registration.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { AuthenticationGuard } from './guards/authentication.guard';

interface IUserResponse {
  id: number;
  phone: string;
  full_name: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registration')
  registration(
    @Body() registrationDto: RegistrationDto,
  ): Promise<TApiResponse<any>> {
    return this.authService.registration(registrationDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto): Promise<TApiResponse<any>> {
    return this.authService.login(loginDto);
  }

  @Post('verify-otp')
  async verifyOtp(
    @Body() data: VerifyOtpDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<TApiResponse<any>> {
    const { accessToken, refreshToken } =
      await this.authService.verifyOtp(data);
    console.log('Setting cookies...', { accessToken, refreshToken });
    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      statusCode: 200,
      success: true,
      message: 'OTP verified successfully',
      data: {
        id: data.user.id,
        phone: data.user.phone,
        full_name: data.user.full_name,
        role: data.user.role,
      },
    };
  }

  @Get('refresh-token')
  async refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    console.log('🚀 ~ AuthController ~ request:', request.cookies);
    const { accessToken } = await this.authService.refreshToken(
      request.cookies,
    );
    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });
    return sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Token refreshed successfully',
      data: null,
    });
  }

  @Get('me')
  @UseGuards(AuthenticationGuard)
  async getCurrentUser(
    @Req() request: Request,
    @Res() response: Response, // Add this
  ): Promise<TApiResponse<IUserResponse>> {
    const user = request.user;
    console.log('🚀 ~ AuthController ~ user:', user);
    return sendResponse(response, {
      success: true,
      statusCode: 200,
      message: 'User retrieved successfully',
      data: {
        id: user.id,
        phone: user.phone,
        full_name: user.full_name,
        role: user.role,
      },
    });
  }

  @Post('logout')
  @UseGuards(AuthenticationGuard)
  async logout(
    @Res({ passthrough: true }) response: Response,
  ): Promise<TApiResponse<null>> {
    // Clear both tokens
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');

    return sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Logged out successfully',
      data: null,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<TApiResponse<any>> {
    return this.authService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<TApiResponse<any>> {
    return this.authService.remove(+id);
  }
}
