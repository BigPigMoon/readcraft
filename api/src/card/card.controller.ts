import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetCurrentUser } from 'src/common/decorators';
import { CreateCardDto, GetCardDto, UpdateCardDto } from './dto';
import { CardService } from './card.service';

@ApiBearerAuth()
@ApiTags('Card')
@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создает новую карточку' })
  create(
    @GetCurrentUser('sub') userId: number,
    @Body() dto: CreateCardDto,
  ): Promise<GetCardDto> {
    return this.cardService.create(userId, dto);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Удаляет карточку' })
  delete(
    @GetCurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) cardId: number,
  ): Promise<void> {
    return this.cardService.delete(userId, cardId);
  }

  @Put('/')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Изменяет карточку' })
  update(
    @GetCurrentUser('sub') userId: number,
    @Body() dto: UpdateCardDto,
  ): Promise<GetCardDto> {
    return this.cardService.update(userId, dto);
  }

  @Get('/')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Получает все карточки из папки' })
  getAllInGroup(
    @GetCurrentUser('sub') userId: number,
    @Query('group_id', ParseIntPipe) folderId: number,
  ): Promise<GetCardDto[]> {
    return this.cardService.getAllInGroupPrivate(userId, folderId);
  }
}
