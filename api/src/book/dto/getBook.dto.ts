import { ApiProperty } from '@nestjs/swagger';
import { Language } from '@prisma/client';

export class GetBookDto {
  @ApiProperty({ description: 'Идентификатор книги', example: '1' })
  id: number;
  //   createdAt: Date;
  //   updatedAt: Date;

  @ApiProperty({ description: 'Имя книги', example: 'Книга1' })
  title: string;

  @ApiProperty({ description: 'Язык книги', example: 'RU' })
  language: Language;

  @ApiProperty({
    description: 'Путь к файлу книги на сервере',
    example: 'uuid',
  })
  filename: string;

  @ApiProperty({
    description: 'Путь к обложке книги на сервере',
    example: 'uuid',
  })
  covePath?: string;

  @ApiProperty({ description: 'Автор книги', example: 'Пушкин' })
  author?: string;

  @ApiProperty({ description: 'Описание книги', example: 'Очень крутая книга' })
  subject?: string;

  @ApiProperty({ description: 'Прогресс книги', example: '75' })
  progress: number;
}
