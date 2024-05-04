import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateFolderDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Имя папки',
    example: 'Крутая папочка',
  })
  title: string;

  @IsNumber()
  @ApiProperty({ description: 'Идентификатор папочки', example: '1' })
  folderId?: number;
}
