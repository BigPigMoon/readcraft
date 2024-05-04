import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateFolderDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Идентификатор папки', example: '1' })
  id: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Имя папки', example: 'Не крутая папка' })
  title: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Идентификатор родительской папки',
    example: '1',
  })
  folderId: number;
}
