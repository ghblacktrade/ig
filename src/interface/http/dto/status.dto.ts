import { IsString } from 'class-validator';

export class StatusQueryDto {
  @IsString()
  id!: string;
}
