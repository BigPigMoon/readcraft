import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookDto, GetBookDto, GetChunkDto, UpdateBookDto } from './dto';
import { Book } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { createReadStream, promises as fs, ReadStream } from 'fs';
import { EPub } from 'epub2';

@Injectable()
export class BookService {
  private readonly logger = new Logger(BookService.name, { timestamp: true });

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateBookDto): Promise<GetBookDto> {
    const newBook = await this.prisma.book.create({
      data: {
        title: dto.title,
        language: dto.language,
        filename: dto.filename,
        author: dto.author,
        subject: dto.subject,
        coverPath: dto.covePath,
      },
    });

    await this.prisma.bookUser.create({
      data: {
        book: { connect: newBook },
        user: {
          connect: {
            id: userId,
          },
        },
      },
      include: {
        book: true,
        user: true,
      },
    });

    return this.getBookDto(newBook);
  }

  async getAll(userId: number): Promise<GetBookDto[]> {
    const book = await this.prisma.bookUser.findMany({
      where: { userId: userId },
      select: { book: true },
    });

    return book
      .filter((data) => data.book.active)
      .map((data) => this.getBookDto(data.book));
  }

  async getById(userId: number, bookId: number): Promise<GetBookDto> {
    const book = await this.prisma.book.findUnique({
      where: { id: bookId, active: true },
    });

    if (!book) {
      throw new NotFoundException('book not found');
    }

    const bookUser = await this.prisma.bookUser.findMany({
      where: { book: { id: book.id }, userId },
    });

    if (!bookUser) {
      throw new ForbiddenException('user is not owner');
    }

    return this.getBookDto(book);
  }

  async update(userId: number, dto: UpdateBookDto): Promise<GetBookDto> {
    const bookUser = await this.prisma.bookUser.findFirst({
      where: { userId, bookId: dto.id },
    });

    if (!bookUser) {
      throw new NotFoundException('book not found');
    }

    const updatedBook = await this.prisma.book.update({
      where: { id: dto.id },
      data: {
        title: dto.title,
        language: dto.language,
        coverPath: dto.covePath,
        filename: dto.filename,
        author: dto.author,
        subject: dto.subject,
        progress: dto.progress,
      },
    });

    return this.getBookDto(updatedBook);
  }

  async delete(userId: number, bookId: number): Promise<void> {
    const bookUser = await this.prisma.bookUser.findFirst({
      where: { bookId, userId },
    });

    if (!bookUser) {
      throw new ForbiddenException('user is not owner');
    }

    await this.prisma.book.update({
      where: { id: bookId },
      data: { active: false },
    });
  }

  async getPage(userId: number, bookId: number): Promise<GetChunkDto> {
    const bookUser = await this.prisma.bookUser.findFirst({
      where: { userId, bookId },
    });

    const book = await this.prisma.book.findUnique({ where: { id: bookId } });

    if (!book.filename) {
      throw new NotFoundException('book file not found');
    }

    const epub = await this.getEpubFile(book.filename);

    const chapter = await epub.getChapterAsync(epub.flow[bookUser.chunk].id);

    return {
      chunk: bookUser.chunk,
      content: chapter,
    };
  }

  async getImageByUrl(bookId, url): Promise<Buffer> {
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw new NotFoundException('');
    }

    const epub = await this.getEpubFile(book.filename);

    console.log(epub.listImage());

    const images = epub.listImage().filter((img) => img.href === url);

    if (images.length === 0) {
      throw new NotFoundException('image of book not found');
    }

    const imageData = await epub.getImageAsync(images[0].id);

    return imageData[0];
  }

  async getImageUrlList(bookId: number): Promise<string[]> {
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw new NotFoundException('');
    }

    const epub = await this.getEpubFile(book.filename);

    return epub.listImage().map((url) => url.href);
  }

  async changePage(
    userId: number,
    bookId: number,
    page: number,
  ): Promise<void> {
    const bookUser = await this.prisma.bookUser.findFirst({
      where: { userId, bookId },
    });

    if (!bookUser) {
      throw new NotFoundException('book not found');
    }

    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book.filename) {
      throw new NotFoundException('book file not found');
    }

    const epub = await this.getEpubFile(book.filename);

    const bookSize = epub.flow.length;
    if (page < 0 || page > bookSize) {
      throw new BadRequestException('page not valid');
    }

    await this.prisma.bookUser.update({
      where: { id: bookUser.id },
      data: { chunk: page },
    });

    const newProgress = (page / bookSize) * 100;

    await this.prisma.book.update({
      where: { id: bookId },
      data: { progress: newProgress },
    });
  }

  async download(userId: number, bookId: number): Promise<ReadStream> {
    const bookUser = await this.prisma.bookUser.findFirst({
      where: { bookId, userId },
    });

    if (!bookUser) {
      throw new ForbiddenException('user is not owner');
    }

    const book = await this.prisma.book.findUnique({ where: { id: bookId } });

    const bookDir = process.env.BOOK_DIR;

    return createReadStream(`${bookDir}/${book.filename}`);
  }

  async upload(userId: number, file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('file not requested');
    }

    const filename = uuidv4();
    const bookDir = process.env.BOOK_DIR;

    await fs.writeFile(`${bookDir}/${filename}`, file.buffer);

    return filename;
  }

  getBookDto(book: Book): GetBookDto {
    return {
      id: book.id,
      title: book.title,
      updatedAt: book.updatedAt,
      createdAt: book.createdAt,
      language: book.language,
      progress: book.progress,
      author: book.author,
      subject: book.subject,
      covePath: book.coverPath,
      filename: book.filename,
    };
  }

  async getEpubFile(filename: string): Promise<EPub> {
    const bookDir = process.env.BOOK_DIR;

    try {
      return await EPub.createAsync(`${bookDir}/${filename}`);
    } catch (err) {
      this.logger.error(err);
      throw new NotFoundException('book not found');
    }
  }
}
