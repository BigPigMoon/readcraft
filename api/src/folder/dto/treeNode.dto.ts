import { ApiProperty } from '@nestjs/swagger';
import { GetFolderDto } from './getFolder.dto';

export class TreeNodeDto {
  @ApiProperty({ description: 'Корень ноды' })
  root: GetFolderDto;

  @ApiProperty({ description: 'Дети ноды' })
  children: TreeNodeDto[];
}
