import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ContentDto {
  @ApiProperty({ description: 'Текст урока' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
