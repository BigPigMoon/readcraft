import { ApiProperty } from '@nestjs/swagger';
import { Language } from '@prisma/client';

export class GetCourseDto {
  @ApiProperty({ description: 'Идентификатор курса', example: '1' })
  id: number;
  @ApiProperty({ description: 'Имя курса', example: 'Course1' })
  title: string;
  @ApiProperty({ description: 'Язык курса', example: 'RU' })
  language: Language;
  @ApiProperty({
    description: 'Является ли пользователь создателем курса',
    example: 'true',
  })
  isOwner: boolean;
}
