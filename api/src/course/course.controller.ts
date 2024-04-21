import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetCourseDto } from './dto/getCourse.dto';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/createCourse.dto';
import { UpdateCourseDto } from './dto';
import { GetCurrentUser } from 'src/common/decorators';

@ApiBearerAuth()
@ApiTags('Course')
@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создает новый курс' })
  create(
    @GetCurrentUser('sub') userId: number,
    @Body() dto: CreateCourseDto,
  ): Promise<GetCourseDto> {
    return this.courseService.create(userId, dto);
  }

  @Get('/')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Возвращет все курсы' })
  getAll(
    @GetCurrentUser('sub') userId: number,
    @Query('subs', ParseBoolPipe) subs: boolean = false,
  ): Promise<GetCourseDto[]> {
    return this.courseService.getAll(userId, subs);
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вовращает конкретный курс' })
  getById(
    @GetCurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) courseId: number,
  ): Promise<GetCourseDto> {
    return this.courseService.getById(userId, courseId);
  }

  @Put('/')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Обновляет информацию о курсе' })
  update(
    @GetCurrentUser('sub') userId: number,
    @Body() dto: UpdateCourseDto,
  ): Promise<GetCourseDto> {
    return this.courseService.update(userId, dto);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Удаляет курс' })
  delete(
    @GetCurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) courseId: number,
  ): Promise<void> {
    return this.courseService.delete(userId, courseId);
  }

  @Post('/sub/:link')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Подписывает пользователя на курс' })
  sub(
    @GetCurrentUser('sub') userId: number,
    @Param('link') inviteLink: string,
  ): Promise<void> {
    return this.courseService.sub(userId, inviteLink);
  }

  @Post('/unsub/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Отписывает пользователя от курса' })
  unsub(
    @GetCurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) courseId: number,
  ): Promise<void> {
    return this.courseService.unsub(userId, courseId);
  }

  @Get('/is/owner/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Проверяет является ли пользователь обладателем курса',
  })
  isOwner(
    @GetCurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) courseId: number,
  ): Promise<boolean> {
    return this.courseService.isOwner(userId, courseId);
  }

  @Get('/gen/link/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Получает ссылку приглашение' })
  genInviteLink(
    @GetCurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) courseId: number,
  ): Promise<string> {
    return this.courseService.genInviteLink(userId, courseId);
  }
}
