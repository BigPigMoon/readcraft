import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { CourseService } from '../course.service';
import { Language, User } from '@prisma/client';
import { CreateCourseDto } from '../dto';

describe('CourseService Int', () => {
  let prisma: PrismaService;
  let courseService: CourseService;

  let user: User;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = moduleRef.get(PrismaService);
    courseService = moduleRef.get(CourseService);

    await prisma.cleanDatabase();

    user = await prisma.user.create({
      data: {
        email: 'joe@gmail.com',
        nickname: 'John',
        hashedPassword: '123',
      },
    });
  });

  it('should create course', async () => {
    const dto: CreateCourseDto = {
      title: 'Cool course',
      language: Language.EN,
    };

    const course = await courseService.create(user.id, dto);

    expect(course).not.toBeNull();
    expect(course.id).not.toBeNull();
    expect(course.title).toBe(dto.title);
    expect(course.language).toBe(dto.language);
    expect(course.isOwner).toBe(true);
  });

  it('should get all courses', async () => {
    const courses = await courseService.getAll(user.id);

    expect(courses).not.toBeNull();
  });

  it('should get some course', async () => {
    const dto: CreateCourseDto = {
      title: 'Cool course',
      language: Language.EN,
    };

    const newCourse = await prisma.course.create({
      data: { title: dto.title, language: dto.language },
    });

    await prisma.courseUser.create({
      data: {
        courseId: newCourse.id,
        userId: user.id,
        owned: true,
      },
    });

    const course = await courseService.getById(user.id, newCourse.id);

    expect(course).not.toBeNull();
    expect(course.id).toBe(newCourse.id);
    expect(course.title).toBe(newCourse.title);
    expect(course.language).toBe(newCourse.language);
    expect(course.isOwner).toBe(true);
  });

  it.todo('should update course by creator');

  it.todo('should not update course by not creator');

  it.todo('should delete course by creater');

  it.todo('should not delete course by not creater');

  it.todo('should subscribe to course');

  it.todo('user already subscribed');

  it.todo('should unsubscribe user');

  it.todo('should throw error, because user not subscribed');

  it.todo('should get course invite link', () => {});
});
