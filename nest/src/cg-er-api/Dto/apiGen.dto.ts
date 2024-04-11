import { IsNotEmpty } from 'class-validator';

export class erapiGenDto {
  @IsNotEmpty()
  key: string;
}
