import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import { UsersService } from './users.service';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { PaginatedUsersResponse } from './interfaces/paginated-users-response.interface';

describe('UsersService', () => {
  let service: UsersService;
  let httpService: HttpService;
  let configService: ConfigService;

  const mockPaginatedResponse: PaginatedUsersResponse = {
    page: 1,
    per_page: 6,
    total: 12,
    total_pages: 2,
    data: [
      {
        id: 1,
        email: 'george.bluth@reqres.in',
        first_name: 'George',
        last_name: 'Bluth',
        avatar: 'https://reqres.in/img/faces/1-image.jpg',
      },
      {
        id: 2,
        email: 'janet.weaver@reqres.in',
        first_name: 'Janet',
        last_name: 'Weaver',
        avatar: 'https://reqres.in/img/faces/2-image.jpg',
      },
    ],
    support: {
      url: 'https://reqres.in/#support-heading',
      text: 'To keep ReqRes free, contributions towards server costs are appreciated!',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'REQRES_BASE_URL') return 'https://reqres.in/api';
              if (key === 'REQRES_API_KEY') return 'reqres-free-v1';
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUsers', () => {
    it('should fetch users with default parameters', async () => {
      const query: GetUsersQueryDto = {};
      const axiosResponse: AxiosResponse<PaginatedUsersResponse> = {
        data: mockPaginatedResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(axiosResponse));

      const result = await service.getUsers(query);

      expect(httpService.get).toHaveBeenCalledWith(
        'https://reqres.in/api/users',
        {
          params: {
            page: 1,
            per_page: 6,
          },
          headers: {
            'x-api-key': 'reqres-free-v1',
          },
        },
      );
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should fetch users with custom page and perPage', async () => {
      const query: GetUsersQueryDto = {
        page: 2,
        perPage: 10,
      };
      const axiosResponse: AxiosResponse<PaginatedUsersResponse> = {
        data: mockPaginatedResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(axiosResponse));

      const result = await service.getUsers(query);

      expect(httpService.get).toHaveBeenCalledWith(
        'https://reqres.in/api/users',
        {
          params: {
            page: 2,
            per_page: 10,
          },
          headers: {
            'x-api-key': 'reqres-free-v1',
          },
        },
      );
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should include delay parameter when provided', async () => {
      const query: GetUsersQueryDto = {
        page: 1,
        perPage: 6,
        delay: 3,
      };
      const axiosResponse: AxiosResponse<PaginatedUsersResponse> = {
        data: mockPaginatedResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(axiosResponse));

      const result = await service.getUsers(query);

      expect(httpService.get).toHaveBeenCalledWith(
        'https://reqres.in/api/users',
        {
          params: {
            page: 1,
            per_page: 6,
            delay: 3,
          },
          headers: {
            'x-api-key': 'reqres-free-v1',
          },
        },
      );
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should handle 404 error from ReqRes API', async () => {
      const query: GetUsersQueryDto = { page: 999 };
      const axiosError: AxiosError = {
        response: {
          status: 404,
          data: { message: 'Not found' },
          statusText: 'Not Found',
          headers: {},
          config: {} as any,
        },
        message: 'Request failed with status code 404',
        name: 'AxiosError',
        config: {} as any,
        isAxiosError: true,
        toJSON: () => ({}),
      };

      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(throwError(() => axiosError));

      await expect(service.getUsers(query)).rejects.toThrow(HttpException);
      await expect(service.getUsers(query)).rejects.toThrow(
        expect.objectContaining({
          status: 404,
        }),
      );
    });

    it('should handle network error with 502 status', async () => {
      const query: GetUsersQueryDto = {};
      const axiosError: AxiosError = {
        message: 'Network Error',
        name: 'AxiosError',
        config: {} as any,
        isAxiosError: true,
        toJSON: () => ({}),
      };

      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(throwError(() => axiosError));

      await expect(service.getUsers(query)).rejects.toThrow(HttpException);
      await expect(service.getUsers(query)).rejects.toThrow(
        expect.objectContaining({
          status: HttpStatus.BAD_GATEWAY,
        }),
      );
    });

    it('should handle unexpected errors with 500 status', async () => {
      const query: GetUsersQueryDto = {};
      const unexpectedError = new Error('Unexpected error');

      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(throwError(() => unexpectedError));

      await expect(service.getUsers(query)).rejects.toThrow(HttpException);
      await expect(service.getUsers(query)).rejects.toThrow(
        expect.objectContaining({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        }),
      );
    });

    it('should use custom base URL from config', async () => {
      const customUrl = 'https://custom-api.example.com';
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'REQRES_BASE_URL') return customUrl;
        if (key === 'REQRES_API_KEY') return 'reqres-free-v1';
        return undefined;
      });

      // Recreate service with new config
      const newService = new UsersService(httpService, configService);

      const query: GetUsersQueryDto = {};
      const axiosResponse: AxiosResponse<PaginatedUsersResponse> = {
        data: mockPaginatedResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(axiosResponse));

      await newService.getUsers(query);

      expect(httpService.get).toHaveBeenCalledWith(`${customUrl}/users`, {
        params: {
          page: 1,
          per_page: 6,
        },
        headers: {
          'x-api-key': 'reqres-free-v1',
        },
      });
    });
  });
});
