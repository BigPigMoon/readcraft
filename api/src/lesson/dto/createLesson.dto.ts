import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({ description: 'Имя урока', example: 'New Lesson' })
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Путь к обложке урока',
    example: 'lkdjsf-34kljdasdf-324',
  })
  coverPath?: string;

  @ApiProperty({ description: 'Описание урока', example: 'Super duper lesson' })
  subject?: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ description: 'Id курса', example: '1' })
  courseId: number;
}
