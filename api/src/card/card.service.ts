import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCardDto, GetCardDto, UpdateCardDto } from './dto';
import { Card } from '@prisma/client';

@Injectable()
export class CardService {
  private readonly logger = new Logger(CardService.name, { timestamp: true });

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateCardDto): Promise<GetCardDto> {
    const folder = await this.prisma.folder.findUnique({
      where: { id: dto.folderId, active: true },
    });

    if (!folder) {
      throw new NotFoundException('folder not found');
    }

    const folderUser = await this.prisma.folderUser.findFirst({
      where: { userId, folderId: dto.folderId },
    });

    if (!folderUser || !folderUser.owned) {
      throw new ForbiddenException('user is not owned');
    }

    const newCard = await this.prisma.card.create({
      data: {
        word: dto.word,
        translation: dto.translation,
        folder: { connect: { id: dto.folderId } },
      },
    });

    return this.getCardDto(newCard);
  }

  async delete(userId: number, cardId: number): Promise<void> {
    const card = await this.prisma.card.findUnique({ where: { id: cardId } });

    const folderUser = await this.prisma.folderUser.findFirst({
      where: { userId, folderId: card.folderId, owned: true },
    });

    if (!folderUser) {
      throw new ForbiddenException('user is not owned');
    }

    await this.prisma.card.update({
      where: { id: cardId },
      data: { active: false },
    });
  }

  async update(userId: number, dto: UpdateCardDto): Promise<GetCardDto> {
    const card = await this.prisma.card.findUnique({
      where: { id: dto.id },
    });

    if (!card) {
      throw new NotFoundException('card not found');
    }

    const folder = await this.prisma.folder.findUnique({
      where: { id: dto.folderId, active: true },
    });

    if (!folder) {
      throw new NotFoundException('folder not found');
    }

    const folderUser = await this.prisma.folderUser.findFirst({
      where: { userId, folderId: card.folderId, owned: true },
    });

    if (!folderUser) {
      throw new ForbiddenException('user is not owned');
    }

    const updatedCard = await this.prisma.card.update({
      where: { id: dto.id },
      data: {
        word: dto.word,
        translation: dto.translation,
        folderId: dto.folderId,
      },
    });

    return this.getCardDto(updatedCard);
  }

  async getAllInGroupPrivate(
    userId: number,
    folderId: number,
  ): Promise<GetCardDto[]> {
    const folder = await this.prisma.folder.findUnique({
      where: { id: folderId, active: true },
    });

    if (!folder) {
      throw new NotFoundException('folder not found');
    }

    const folderUser = await this.prisma.folderUser.findFirst({
      where: { userId, folderId, owned: true },
    });

    if (!folderUser) {
      throw new ForbiddenException('user is not owned');
    }

    return this.getAllInGroup(folderId);
  }

  async getAllInGroup(folderId: number): Promise<GetCardDto[]> {
    const cards = await this.prisma.card.findMany({
      where: { folderId, active: true },
    });

    return cards.map((card) => this.getCardDto(card));
  }

  getCardDto(card: Card): GetCardDto {
    return {
      id: card.id,
      word: card.word,
      translation: card.translation,
      folderId: card.folderId,
    };
  }
}
