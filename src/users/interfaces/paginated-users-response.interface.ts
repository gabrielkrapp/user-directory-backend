import { User } from './user.interface';

export interface Support {
  url: string;
  text: string;
}

export interface PaginatedUsersResponse {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: User[];
  support?: Support;
}
