import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCardDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Слово', example: 'Bread' })
  word: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Перевод', example: 'Хлеб' })
  translation: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ description: 'Id папки', example: '1' })
  folderId: number;
}
