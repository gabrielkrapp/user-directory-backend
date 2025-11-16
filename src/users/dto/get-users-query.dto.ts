import { IsNumber, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetUsersQueryDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  perPage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(60)
  @Type(() => Number)
  delay?: number;
}
