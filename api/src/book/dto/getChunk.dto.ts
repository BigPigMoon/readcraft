import { ApiProperty } from '@nestjs/swagger';

export class GetChunkDto {
  @ApiProperty({ description: 'Номер участка книги', example: '1' })
  chunk: number;

  @ApiProperty({
    description: 'Контент книги',
    example: 'Генри пошел и денюжку нашел',
  })
  content: string;
}
