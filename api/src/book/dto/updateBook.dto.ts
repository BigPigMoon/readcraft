import { ApiProperty } from '@nestjs/swagger';
import { Language } from '@prisma/client';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateBookDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: 'Идентификатор книги', example: '1' })
  id: number;

  @IsString()
  @ApiProperty({ description: 'Имя книги', example: 'Книга1' })
  title?: string;

  @ApiProperty({ description: 'Язык книги', example: 'RU', enum: Language })
  language?: Language;

  @IsString()
  @ApiProperty({
    description: 'Путь к файлу книги на сервере',
    example: 'uuid',
  })
  filename?: string;

  @IsString()
  @ApiProperty({
    description: 'Путь к обложке книги на сервере',
    example: 'uuid',
  })
  covePath?: string;

  @IsString()
  @ApiProperty({ description: 'Автор книги', example: 'Пушкин' })
  author?: string;

  @IsString()
  @ApiProperty({ description: 'Описание книги', example: 'Очень крутая книга' })
  subject?: string;

  @IsNumber()
  @ApiProperty({ description: 'Прогресс книги', example: '75' })
  progress?: number;
}
