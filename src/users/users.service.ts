import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { PaginatedUsersResponse } from './interfaces/paginated-users-response.interface';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl =
      this.configService.get<string>('REQRES_BASE_URL') ||
      'https://reqres.in/api';
    this.apiKey =
      this.configService.get<string>('REQRES_API_KEY') || 'reqres-free-v1';
  }

  async getUsers(query: GetUsersQueryDto): Promise<PaginatedUsersResponse> {
    const page = query.page || 1;
    const perPage = query.perPage || 6;

    const params: Record<string, number> = {
      page,
      per_page: perPage,
    };

    if (query.delay !== undefined) {
      params.delay = query.delay;
    }

    try {
      this.logger.log(
        `Fetching users from ReqRes API: page=${page}, per_page=${perPage}${query.delay !== undefined ? `, delay=${query.delay}` : ''}`,
      );

      const response = await firstValueFrom(
        this.httpService.get<PaginatedUsersResponse>(`${this.baseUrl}/users`, {
          params,
          headers: {
            'x-api-key': this.apiKey,
          },
        }),
      );

      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  private handleError(error: unknown): never {
    if (this.isAxiosError(error)) {
      const status = error.response?.status || HttpStatus.BAD_GATEWAY;
      const message =
        (error.response?.data as { message?: string })?.message ||
        error.message ||
        'Failed to fetch users from upstream API';

      this.logger.error(
        `ReqRes API error: ${message} (status: ${status})`,
        error.stack,
      );

      throw new HttpException(
        {
          statusCode:
            status >= 400 && status < 500 ? status : HttpStatus.BAD_GATEWAY,
          message: message,
        },
        status >= 400 && status < 500 ? status : HttpStatus.BAD_GATEWAY,
      );
    }

    this.logger.error('Unexpected error while fetching users', error);
    throw new HttpException(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  private isAxiosError(error: unknown): error is AxiosError {
    return (
      typeof error === 'object' &&
      error !== null &&
      ('isAxiosError' in error ||
        'response' in error ||
        error instanceof AxiosError)
    );
  }
}
