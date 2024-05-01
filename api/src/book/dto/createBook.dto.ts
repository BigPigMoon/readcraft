import { ApiProperty } from '@nestjs/swagger';
import { Language } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBookDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Имя книги', example: 'Книга1' })
  title: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'Язык книги', example: 'RU', enum: Language })
  language: Language;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Путь к файлу книги на сервере',
    example: 'uuid',
  })
  filename: string;

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
}
