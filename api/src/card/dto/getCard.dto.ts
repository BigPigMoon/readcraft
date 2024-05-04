import { ApiProperty } from '@nestjs/swagger';

export class GetCardDto {
  @ApiProperty({ description: 'Идентификатор карточки', example: '1' })
  id: number;

  @ApiProperty({ description: 'Слово', example: 'Bread' })
  word: string;

  @ApiProperty({ description: 'Перевод', example: 'Хлеб' })
  translation: string;

  @ApiProperty({ description: 'Идентификатор папки', example: '1' })
  folderId: number;
}
