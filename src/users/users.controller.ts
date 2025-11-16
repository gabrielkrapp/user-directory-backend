import { Controller, Get, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { PaginatedUsersResponse } from './interfaces/paginated-users-response.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUsers(
    @Query() query: GetUsersQueryDto,
  ): Promise<PaginatedUsersResponse> {
    return this.usersService.getUsers(query);
  }
}
