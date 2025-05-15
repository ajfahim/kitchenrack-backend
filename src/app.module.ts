import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';

import config from './config/config';
import { CategoryModule } from './features/category/category.module';
import { OtpModule } from './features/otp/otp.module';
import { ProductModule } from './features/product/product.module';
import { UserModule } from './features/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, load: [config] }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret'),
      }),
      global: true,
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    OtpModule,
    CategoryModule,
    ProductModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
