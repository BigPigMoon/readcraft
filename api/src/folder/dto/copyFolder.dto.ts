import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CopyFolderDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Код приглашения пользователя',
    example: 'laksdjfowieru',
  })
  inviteCode: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ description: 'Папка куда копировать', example: '1' })
  parentId: number;
}
