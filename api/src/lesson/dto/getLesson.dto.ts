import { ApiProperty } from '@nestjs/swagger';

export class GetLessonDto {
  @ApiProperty({ description: 'Идентификатор урока', example: '1' })
  id: number;

  @ApiProperty({ description: 'Имя урока', example: 'New Lesson' })
  title: string;

  @ApiProperty({
    description: 'Путь к обложке урока',
    example: 'lkdjsf-34kljdasdf-324',
  })
  coverPath?: string;

  @ApiProperty({ description: 'Описание урока', example: 'Super duper lesson' })
  subject?: string;

  @ApiProperty({ description: 'Id курса', example: '1' })
  courseId: number;
}
