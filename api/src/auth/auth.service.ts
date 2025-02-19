import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { SingInDto, SingUpDto } from './dto';
import { Tokens } from './types';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { FolderService } from 'src/folder/folder.service';
import { BookService } from 'src/book/book.service';
import { CourseService } from 'src/course/course.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private folderService: FolderService,
    private bookService: BookService,
    private courseService: CourseService,
  ) {}

  async signUpLocal(dto: SingUpDto): Promise<Tokens> {
    const hash = await this.hashData(dto.password);

    const findUserByName = await this.prisma.user.findUnique({
      where: { nickname: dto.name },
    });
    if (findUserByName) {
      throw new BadRequestException('Nickname already in used');
    }

    const findUserByEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (findUserByEmail) {
      throw new BadRequestException('Email already in used');
    }

    const newUser = await this.prisma.user.create({
      data: {
        nickname: dto.name,
        email: dto.email,
        hashedPassword: hash,
      },
    });

    this.folderService.create(newUser.id, { title: newUser.nickname });
    this.bookService.create(newUser.id, {
      title: "Gulliver's Travels",
      language: 'EN',
      filename: 'book1.epub',
      author: 'Jonathan Swift',
      covePath: 'book1.jpg',
    });
    this.bookService.create(newUser.id, {
      title: 'The Adventures of Tom Sawyer',
      language: 'EN',
      filename: 'book2.epub',
      author: 'Mark Twain',
      covePath: 'book2.jpg',
    });
    this.courseService.sub(newUser.id, 'f533da47-f9c0-4ae9-8be3-b15404a42b4d');

    const tokens = await this.getTokens(newUser.id, newUser.email);
    await this.updateRtHash(newUser.id, tokens.refreshToken);

    return tokens;
  }

  async signInLocal(dto: SingInDto): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.hashedPassword,
    );

    if (!passwordMatches) {
      throw new ForbiddenException('Invalid password');
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: number): Promise<void> {
    try {
      await this.prisma.user.update({
        where: {
          id: userId,
          hashedRt: {
            not: null,
          },
        },
        data: {
          hashedRt: null,
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        this.logger.debug('logout function: ' + err.meta.cause);
      } else {
        this.logger.error('logout function: unknown error ' + err.message);
      }
    }
  }

  async refreshTokens(userId: number, rt: string): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user || !user.hashedRt) {
      throw new ForbiddenException('Access Denied');
    }

    const rtMatcher = await bcrypt.compare(rt, user.hashedRt);

    console.log('refresh token match ', rtMatcher);
    if (!rtMatcher) {
      throw new ForbiddenException('Access Denied');
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refreshToken);

    return tokens;
  }

  async updateRtHash(userId: number, rt: string): Promise<void> {
    const hash = await this.hashData(rt);

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRt: hash,
      },
    });
  }

  async hashData(data: string): Promise<string> {
    return await bcrypt.hash(data, 10);
  }

  async getTokens(userId: number, email: string): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: process.env.AT_SECRET_KEY,
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: process.env.RT_SECRET_KEY,
          expiresIn: '15d',
        },
      ),
    ]);

    return {
      accessToken: at,
      refreshToken: rt,
    };
  }
}
