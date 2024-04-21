import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Language } from '@prisma/client';

export class CreateCourseDto {
  @ApiProperty({ example: 'Couser1', description: 'Имя курса' })
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'RU', description: 'Язык курса', enum: Language })
  @IsNotEmpty()
  language: Language;
}
