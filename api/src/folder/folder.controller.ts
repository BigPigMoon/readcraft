import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FolderService } from './folder.service';
import { GetCurrentUser } from 'src/common/decorators';
import {
  CopyFolderDto,
  CreateFolderDto,
  GetFolderDto,
  GetItemDto,
  TreeNodeDto,
  UpdateFolderDto,
} from './dto';

@ApiBearerAuth()
@ApiTags('Folder')
@Controller('folder')
export class FolderController {
  constructor(private readonly folderService: FolderService) {}

  @ApiOperation({ summary: 'Создает новую папку' })
  @Post('/')
  create(
    @GetCurrentUser('sub') userId: number,
    @Body() dto: CreateFolderDto,
  ): Promise<GetFolderDto> {
    return this.folderService.create(userId, dto);
  }

  @ApiOperation({ summary: 'Удаляет папку' })
  @Delete('/:id')
  delete(
    @GetCurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) folderId: number,
  ): Promise<void> {
    return this.folderService.delete(userId, folderId);
  }

  @ApiOperation({ summary: 'Обновляет папку, в том числе переносит' })
  @Put('/')
  update(
    @GetCurrentUser('sub') userId: number,
    @Body() dto: UpdateFolderDto,
  ): Promise<GetFolderDto> {
    return this.folderService.update(userId, dto);
  }

  @ApiOperation({ summary: 'Получить корень для пользователя' })
  @Get('/root')
  getRootFolder(@GetCurrentUser('sub') userId: number): Promise<GetFolderDto> {
    return this.folderService.getUserRootFolder(userId);
  }

  @ApiOperation({ summary: 'Получить все из папки' })
  @Get('/items/:id')
  getItems(
    @GetCurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) folderId: number,
  ): Promise<GetItemDto> {
    return this.folderService.getItemsPrivate(userId, folderId);
  }

  @ApiOperation({ summary: 'Получить путь до папки' })
  @Get('/path/:id')
  getPath(
    @GetCurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) folderId: number,
  ): Promise<GetFolderDto[]> {
    return this.folderService.getPath(userId, folderId);
  }

  @ApiOperation({ summary: 'Получить древо папок' })
  @Get('/tree')
  getTree(@GetCurrentUser('sub') userId: number): Promise<TreeNodeDto> {
    return this.folderService.getTree(userId);
  }

  @ApiOperation({ summary: 'Скопировать папки одного пользователя другому' })
  @Post('/copy')
  copy(
    @GetCurrentUser('sub') userId: number,
    @Body() dto: CopyFolderDto,
  ): Promise<void> {
    return this.folderService.copy(userId, dto);
  }
}
