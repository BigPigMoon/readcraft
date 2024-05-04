import { ApiProperty } from '@nestjs/swagger';

export class GetFolderDto {
  @ApiProperty({ description: 'Идентификатор папки', example: '1' })
  id: number;

  @ApiProperty({ description: 'Имя папки', example: 'Крутая папка' })
  title: string;

  @ApiProperty({
    description: 'Код приглашения папки',
    example: 'klsdjfuioweurlj',
  })
  inviteCode: string;

  @ApiProperty({ description: 'Идентификатор родителя', example: '1' })
  parentId: number;
}
