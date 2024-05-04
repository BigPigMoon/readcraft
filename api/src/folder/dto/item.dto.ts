import { ApiProperty } from '@nestjs/swagger';
import { GetFolderDto } from './getFolder.dto';
import { GetCardDto } from 'src/card/dto';

export class GetItemDto {
  @ApiProperty({ description: 'Массив карточек' })
  cards?: GetCardDto[];

  @ApiProperty({ description: 'Массив папочек' })
  folders?: GetFolderDto[];
}
