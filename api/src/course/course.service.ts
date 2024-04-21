import {
  ForbiddenException,
  NotFoundException,
  Injectable,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { CreateCourseDto, GetCourseDto, UpdateCourseDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { Course } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CourseService {
  private readonly logger = new Logger(CourseService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateCourseDto): Promise<GetCourseDto> {
    const newCourse = await this.prisma.course.create({
      data: {
        language: dto.language,
        title: dto.title,
      },
    });

    await this.prisma.courseUser.create({
      data: {
        course: {
          connect: newCourse,
        },
        owned: true,
        user: { connect: { id: userId } },
      },
      include: {
        course: true,
        user: true,
      },
    });

    return this.getCourseDto(userId, newCourse);
  }

  async getAll(userId: number, subs: boolean): Promise<GetCourseDto[]> {
    let courseUserIds: number[] = [];

    if (subs === true) {
      courseUserIds = (
        await this.prisma.courseUser.findMany({
          where: {
            userId,
          },
        })
      ).map((el) => {
        return el.courseId;
      });
    }

    let courses = [];
    if (courseUserIds.length === 0) {
      courses = await this.prisma.course.findMany({
        where: { active: true },
      });
    } else {
      courses = await this.prisma.course.findMany({
        where: { active: true, id: { in: courseUserIds } },
      });
    }

    const courseDtos = await Promise.all(
      courses.map(async (val) => await this.getCourseDto(userId, val)),
    );

    return courseDtos;
  }

  async getById(userId: number, courseId: number): Promise<GetCourseDto> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId, active: true },
    });

    if (!course) {
      throw new NotFoundException('course not found');
    }

    return await this.getCourseDto(userId, course);
  }

  async update(userId: number, dto: UpdateCourseDto): Promise<GetCourseDto> {
    const courseUser = await this.prisma.courseUser.findFirst({
      where: { userId: userId, courseId: dto.id },
    });

    if (!courseUser || !courseUser.owned) {
      throw new ForbiddenException('user is not owner');
    }

    const updatedCourse = await this.prisma.course.update({
      data: { title: dto.title, language: dto.language },
      where: { id: dto.id },
    });

    return await this.getCourseDto(userId, updatedCourse);
  }

  async delete(userId: number, courseId: number): Promise<void> {
    if (!(await this.isOwner(userId, courseId))) {
      throw new ForbiddenException('user is not owner');
    }

    await this.prisma.course.update({
      where: { id: courseId },
      data: { active: false },
    });

    await this.prisma.lesson.updateMany({
      where: {
        courseId,
      },
      data: {
        active: false,
      },
    });
  }

  async sub(userId: number, inviteLink: string): Promise<void> {
    const course = await this.prisma.course.findFirst({
      where: { inviteLink: inviteLink, active: true },
    });

    if (!course) {
      throw new NotFoundException('course not found');
    }

    const couserUser = await this.prisma.courseUser.findFirst({
      where: {
        courseId: course.id,
        userId,
      },
      include: {
        user: true,
        course: true,
      },
    });

    if (couserUser) {
      throw new BadRequestException('user already subscribed');
    }

    await this.prisma.courseUser.create({
      data: { courseId: course.id, userId: userId, owned: false },
      include: { course: true, user: true },
    });
  }

  async unsub(userId: number, courseId: number): Promise<void> {
    if (await this.isOwner(userId, courseId)) {
      throw new ForbiddenException('user is course creator');
    }

    const courseUsers = await this.prisma.courseUser.findMany({
      where: { userId, courseId, owned: false },
    });

    if (!courseUsers || courseUsers.length === 0) {
      throw new NotFoundException('user not subscribe to course');
    }

    await this.prisma.courseUser.deleteMany({
      where: { userId, courseId, owned: false },
    });
  }

  async isOwner(userId: number, courseId: number): Promise<boolean> {
    const courseUser = await this.prisma.courseUser.findFirst({
      where: { courseId, userId },
      include: { course: true, user: true },
    });

    if (courseUser === null) return false;

    return courseUser.owned;
  }

  async genInviteLink(userId: number, courseId: number): Promise<string> {
    if (!(await this.isOwner(userId, courseId))) {
      throw new ForbiddenException('user is not owner');
    }

    const course = await this.prisma.course.findUnique({
      where: { id: courseId, active: true },
    });

    if (!course) {
      throw new NotFoundException('course not found');
    }

    const inviteLink = uuidv4();

    await this.prisma.course.update({
      where: { id: courseId },
      data: { inviteLink: inviteLink },
    });

    return inviteLink;
  }

  async getCourseDto(userId: number, course: Course): Promise<GetCourseDto> {
    return {
      id: course.id,
      title: course.title,
      isOwner: await this.isOwner(userId, course.id),
      language: course.language,
    };
  }
}
