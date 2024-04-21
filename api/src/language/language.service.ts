import { Injectable, Logger } from '@nestjs/common';
import { Language } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LanguageService {
  private readonly logger = new Logger(LanguageService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getLanguages(): Promise<string[]> {
    return Object.values(Language);
  }
}
