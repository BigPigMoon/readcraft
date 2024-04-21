import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateLessonDto, GetLessonDto, UpdateLessonDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CourseService } from 'src/course/course.service';
import { Lesson } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';

@Injectable()
export class LessonService {
  private readonly logger = new Logger(LessonService.name, { timestamp: true });

  constructor(
    private readonly prisma: PrismaService,
    private readonly courseService: CourseService,
  ) {}

  async create(userId: number, dto: CreateLessonDto): Promise<GetLessonDto> {
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });

    if (!course) {
      throw new NotFoundException('couser not found');
    }

    if (!course.active) {
      throw new BadRequestException('course is deactivated');
    }

    const isOwnered = await this.courseService.isOwner(userId, dto.courseId);

    if (!isOwnered) {
      throw new ForbiddenException('user is not ownered');
    }

    const lessonFilename = `${uuidv4()}.md`;

    const direcotry = process.env.LESSON_DIR;

    fs.writeFile(`${direcotry}/${lessonFilename}`, '', 'utf-8', () => {});

    const newLesson = await this.prisma.lesson.create({
      data: {
        title: dto.title,
        course: { connect: course },
        contentPath: lessonFilename,
      },
      include: { course: true },
    });

    return this.getLessonDto(newLesson);
  }

  async getAll(userId: number, courseId: number): Promise<GetLessonDto[]> {
    const courseUser = await this.prisma.courseUser.findMany({
      where: { userId, courseId },
    });

    if (!courseUser) {
      throw new BadRequestException('user is not subscribed');
    }

    const lessons = await this.prisma.lesson.findMany({
      where: { courseId: courseId, active: true },
    });

    return lessons.map((el) => this.getLessonDto(el));
  }

  async getById(userId: number, lessonId: number): Promise<GetLessonDto> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId, active: true },
    });

    if (!lesson) {
      throw new NotFoundException('lesson is not found');
    }

    const courseUser = await this.prisma.courseUser.findMany({
      where: { userId, courseId: lesson.courseId },
    });

    if (!courseUser) {
      throw new BadRequestException('user is not subscribed');
    }

    return this.getLessonDto(lesson);
  }

  async update(userId: number, dto: UpdateLessonDto): Promise<GetLessonDto> {
    await this.isUserOwnered(userId, dto.id);

    const updatedLesson = await this.prisma.lesson.update({
      where: { id: dto.id },
      data: {
        title: dto.title,
        subject: dto.subject,
        coverPath: dto.coverPath,
      },
    });

    return this.getLessonDto(updatedLesson);
  }

  async delete(userId: number, lessonId: number): Promise<void> {
    await this.isUserOwnered(userId, lessonId);

    await this.prisma.lesson.update({
      where: { id: lessonId },
      data: { active: false },
    });
  }

  async uploadText(
    userId: number,
    lessonId: number,
    text: string,
  ): Promise<void> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('lesson not found');
    }

    const courseUser = await this.prisma.courseUser.findMany({
      where: { userId, courseId: lesson.courseId, owned: true },
    });

    if (!courseUser) {
      throw new ForbiddenException('user is not ownered');
    }

    const lessonDir = process.env.LESSON_DIR;

    this.logger.log(text);

    fs.writeFile(`${lessonDir}/${lesson.contentPath}`, text, 'utf-8', () => {});
  }

  async getContent(userId: number, lessonId: number): Promise<string> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('lesson not found');
    }

    const courseUser = await this.prisma.courseUser.findMany({
      where: { userId, courseId: lesson.courseId, owned: true },
    });

    if (!courseUser) {
      throw new ForbiddenException('user is not ownered');
    }

    const lessonDir = process.env.LESSON_DIR;

    return fs.readFileSync(`${lessonDir}/${lesson.contentPath}`, 'utf-8');
  }

  getLessonDto(lesson: Lesson): GetLessonDto {
    return {
      id: lesson.id,
      title: lesson.title,
      courseId: lesson.courseId,
      coverPath: lesson.coverPath,
      subject: lesson.subject,
    };
  }

  async isUserOwnered(userId: number, lessonId: number): Promise<boolean> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('lesson not found');
    }

    const courseUser = await this.prisma.courseUser.findMany({
      where: { userId, courseId: lesson.courseId, owned: true },
    });

    if (!courseUser) {
      throw new ForbiddenException('user is not ownered');
    }

    return true;
  }
}
