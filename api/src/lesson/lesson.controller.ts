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
import { LessonService } from './lesson.service';
import { CreateLessonDto, GetLessonDto, UpdateLessonDto } from './dto';
import { ContentDto } from './dto/content.dto';

@ApiBearerAuth()
@ApiTags('Lesson')
@Controller('lesson')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создает новый урок' })
  create(
    @GetCurrentUser('sub') userId: number,
    @Body() dto: CreateLessonDto,
  ): Promise<GetLessonDto> {
    return this.lessonService.create(userId, dto);
  }

  @Get('/')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Возвращает все уроки' })
  getAll(
    @GetCurrentUser('sub') userId: number,
    @Query('course', ParseIntPipe) courseId: number,
  ): Promise<GetLessonDto[]> {
    return this.lessonService.getAll(userId, courseId);
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Возвращает конкретный урок' })
  getById(
    @GetCurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) lessonId: number,
  ): Promise<GetLessonDto> {
    return this.lessonService.getById(userId, lessonId);
  }

  @Put('/')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Обновляет урок' })
  update(
    @GetCurrentUser('sub') userId: number,
    @Body() dto: UpdateLessonDto,
  ): Promise<GetLessonDto> {
    return this.lessonService.update(userId, dto);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Удаляет урок' })
  delete(
    @GetCurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) lessonId: number,
  ): Promise<void> {
    return this.lessonService.delete(userId, lessonId);
  }

  @Post('/content/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Загружает новый контент в урок' })
  uploadText(
    @GetCurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) lessonId: number,
    @Body() body: ContentDto,
  ): Promise<void> {
    return this.lessonService.uploadText(userId, lessonId, body.content);
  }

  @Get('/content/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Возвращает контент урок' })
  getContent(
    @GetCurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) lessonId: number,
  ): Promise<string> {
    return this.lessonService.getContent(userId, lessonId);
  }
}
