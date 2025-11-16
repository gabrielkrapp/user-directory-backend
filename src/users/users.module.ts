import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 120000, // 2 minutes to support large delay values
      maxRedirects: 5,
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
