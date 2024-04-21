import { ApiProperty } from '@nestjs/swagger';
import { Language } from '@prisma/client';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateCourseDto {
  @ApiProperty({ description: 'Идентификатор курса', example: '1' })
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Имя курса', example: 'Course1' })
  title: string;

  @ApiProperty({ description: 'Язык курса', example: 'RU' })
  language: Language;
}
