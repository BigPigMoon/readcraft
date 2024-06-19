import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { BookService } from './book.service';
import { GetCurrentUser, Public } from 'src/common/decorators';
import { CreateBookDto, UpdateBookDto } from './dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReadStream } from 'fs';

@ApiBearerAuth()
@ApiTags('Book')
@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создает новую книгу' })
  create(@GetCurrentUser('sub') userId: number, @Body() dto: CreateBookDto) {
    return this.bookService.create(userId, dto);
  }

  @Get('/')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Возвращает все книги' })
  getAll(@GetCurrentUser('sub') userId: number) {
    return this.bookService.getAll(userId);
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Возвращает конкретную книгу' })
  getById(
    @GetCurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) bookId: number,
  ) {
    return this.bookService.getById(userId, bookId);
  }

  @Put('/')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Обновляет книгу' })
  update(@GetCurrentUser('sub') userId: number, @Body() dto: UpdateBookDto) {
    return this.bookService.update(userId, dto);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Удаляет книгу' })
  delete(
    @GetCurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) bookId: number,
  ) {
    return this.bookService.delete(userId, bookId);
  }

  @Get('/page/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Возвращает кусочек книги (главу)' })
  getPage(
    @GetCurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) bookId: number,
  ) {
    return this.bookService.getPage(userId, bookId);
  }

  @Post('/page/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Изменяет страницу' })
  changePage(
    @GetCurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) bookId: number,
    @Query('page', ParseIntPipe) page: number,
  ) {
    return this.bookService.changePage(userId, bookId, page);
  }

  @Get('/page/image/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Получает картинку' })
  @Public()
  async getImageByUrl(
    @Param('id', ParseIntPipe) bookId: number,
    @Query('url') imgUrl: string,
    @Res() res,
  ) {
    const imageBuffer: Buffer = await this.bookService.getImageByUrl(
      bookId,
      imgUrl,
    );

    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Length', imageBuffer.length);

    res.end(imageBuffer);
  }

  @Get('/page/image/list/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Получает картинку' })
  @Public()
  async getImagesUrls(@Param('id', ParseIntPipe) bookId: number) {
    return this.bookService.getImageUrlList(bookId);
  }

  @Get('/download/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Скачивает книгу' })
  async download(
    @GetCurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) bookId: number,
    @Res() res,
  ) {
    const file: ReadStream = await this.bookService.download(userId, bookId);
    file.pipe(res);
  }

  @Post('/upload')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Загружает книгу' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        comment: { type: 'string' },
        outletId: { type: 'integer' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @GetCurrentUser('sub') userId: number,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'epub',
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    return this.bookService.upload(userId, file);
  }
}
