import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateCardDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ description: 'Идентификатор карточки', example: '1' })
  id: number;

  @IsString()
  @ApiProperty({ description: 'Слово', example: 'Bread' })
  word?: string;

  @IsString()
  @ApiProperty({ description: 'Перевод', example: 'Хлеб' })
  translation?: string;

  @IsNumber()
  @ApiProperty({ description: 'Идентификатор папки', example: '1' })
  folderId?: number;
}
