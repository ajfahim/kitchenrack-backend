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
import sendResponse from 'src/common/utils/sendResponse';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegistrationDto } from './dto/registration.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { AuthenticationGuard } from './guards/authentication.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registration')
  registration(@Body() registrationDto: RegistrationDto) {
    return this.authService.registration(registrationDto);
  }
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('verify-otp')
  async verifyOtp(
    @Body() data: VerifyOtpDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.verifyOtp(data);
    response.cookie('access_token', accessToken);
    response.cookie('refresh_token', refreshToken);
  }

  @Get('refresh-token')
  async refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    console.log(request.cookies);
    const { accessToken } = await this.authService.refreshToken(
      request.cookies,
    );
    response.cookie('access_token', accessToken);
    return sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'refreshed',
      data: null,
    });
  }

  @Get('me')
  @UseGuards(AuthenticationGuard) // Your authentication guard
  async getCurrentUser(@Req() request: Request) {
    const user = request.user;
    return {
      success: true,
      statusCode: 200,
      message: 'User retrieved successfully',
      data: {
        id: user.id,
        phone: user.phone,
        full_name: user.full_name,
        // Add other user fields you want to expose
      },
    };
  }

  @Post('logout')
  @UseGuards(AuthenticationGuard)
  async logout(@Res({ passthrough: true }) response: Response) {
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
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
