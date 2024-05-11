import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ImageService } from './image.service';
import { ReadStream } from 'fs';
import * as mime from 'mime-types';

@ApiBearerAuth()
@ApiTags('Image')
@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Get('/download/:url')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Возвращет картинку' })
  async download(@Param('url') imageUrl: string, @Res() res) {
    const file: ReadStream = await this.imageService.download(imageUrl);
    file.pipe(res);
  }

  @Post('/upload')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Загружает картинку' })
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
  upload(@UploadedFile() file: Express.Multer.File) {
    const fileType = mime.lookup(file.originalname);
    if (!fileType || !fileType.startsWith('image')) {
      throw new BadRequestException('invalid file type');
    }

    return this.imageService.upload(file);
  }
}
