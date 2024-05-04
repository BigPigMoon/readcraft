import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CopyFolderDto,
  CreateFolderDto,
  GetFolderDto,
  GetItemDto,
  TreeNodeDto,
  UpdateFolderDto,
} from './dto';
import { v4 as uuidv4 } from 'uuid';
import { Folder } from '@prisma/client';
import { CardService } from 'src/card/card.service';

@Injectable()
export class FolderService {
  private readonly logger = new Logger(FolderService.name, { timestamp: true });

  constructor(
    private readonly prisma: PrismaService,
    private readonly cardService: CardService,
  ) {}

  async create(userId: number, dto: CreateFolderDto): Promise<GetFolderDto> {
    let parentFolder: Folder;
    if (dto.folderId) {
      parentFolder = await this.prisma.folder.findUnique({
        where: { id: dto.folderId, active: true },
      });

      if (!parentFolder) {
        throw new NotFoundException('folder not found');
      }
    }

    if (dto.folderId && !(await this.isOwner(userId, dto.folderId))) {
      throw new ForbiddenException('user is not owned');
    }

    const newFolder = await this.prisma.folder.create({
      data: {
        title: dto.title,
        parentId: dto.folderId,
        inviteCode: uuidv4(),
      },
    });

    if (dto.folderId && parentFolder) {
      await this.prisma.folder.update({
        where: { id: parentFolder.id },
        data: { children: { connect: newFolder } },
      });
    }

    await this.prisma.folderUser.create({
      data: {
        folderId: newFolder.id,
        userId,
        owned: true,
      },
    });

    return this.getFolderDto(newFolder);
  }

  async delete(userId: number, folderId: number): Promise<void> {
    const folder = await this.prisma.folder.findUnique({
      where: { id: folderId, active: true },
      include: { parent: true },
    });

    if (!folder) {
      throw new NotFoundException('folder not found');
    }

    if (!folder.parent) {
      throw new BadRequestException('do not use root folder');
    }

    if (!(await this.isOwner(userId, folderId))) {
      throw new ForbiddenException('user is not owned');
    }

    await this.prisma.folder.update({
      where: { id: folderId },
      data: { active: false },
    });
  }

  async update(userId: number, dto: UpdateFolderDto): Promise<GetFolderDto> {
    const folder = await this.prisma.folder.findUnique({
      where: { id: dto.id, active: true },
      include: { parent: true },
    });

    if (!folder) {
      throw new NotFoundException('folder not found');
    }

    if (folder.id === dto.folderId) {
      throw new BadRequestException('do not move folder in self');
    }

    if (!(await this.isOwner(userId, dto.id))) {
      throw new ForbiddenException('user is not owned');
    }

    const updatedFolder = await this.prisma.folder.update({
      where: { id: dto.id },
      data: { title: dto.title, parentId: dto.folderId },
    });

    return this.getFolderDto(updatedFolder);
  }

  async getUserRootFolder(userId: number): Promise<GetFolderDto> {
    const folderUser = await this.prisma.folderUser.findFirst({
      where: { userId, owned: true, folder: { parent: null } },
      select: { folder: true },
    });

    if (!folderUser) {
      throw new NotFoundException('folder not found');
    }

    return this.getFolderDto(folderUser.folder);
  }

  async getItemsPrivate(userId: number, folderId: number): Promise<GetItemDto> {
    const folder = await this.prisma.folder.findUnique({
      where: { id: folderId, active: true },
    });

    if (!folder) {
      throw new NotFoundException('folder not found');
    }

    if (!(await this.isOwner(userId, folderId))) {
      throw new ForbiddenException('user is not owned');
    }

    const cards = await this.cardService.getAllInGroupPrivate(userId, folderId);
    const folders = await this.getChildren(folderId);

    return {
      cards,
      folders,
    };
  }

  /**
   * Возвращаем путь до папки
   *
   * Т.е. идем от дочернего объекта к родительскому
   *
   * @param {number} userId
   * @param {number} folderId
   * @return {Promise<GetFolderDto[]>}
   * @memberof FolderService
   */
  async getPath(userId: number, folderId: number): Promise<GetFolderDto[]> {
    let folder = await this.prisma.folder.findUnique({
      where: { id: folderId, active: true },
      include: { parent: true },
    });

    if (!folder) {
      throw new NotFoundException('folder not found');
    }

    if (!(await this.isOwner(userId, folderId))) {
      throw new ForbiddenException('user is not owned');
    }

    const res: GetFolderDto[] = [this.getFolderDto(folder)];
    while (folder.parent != null) {
      folder = await this.prisma.folder.findUnique({
        where: { id: folder.parentId, active: true },
        include: { parent: true },
      });

      if (!folder) {
        throw new NotFoundException('folder not found');
      }

      res.push(this.getFolderDto(folder));
    }

    return res.reverse();
  }

  /**
   * Возвращает всех детей папки
   *
   * Т.е. идем от родителя к дочерним
   *
   * @param {number} userId
   * @return {TreeNodeDto}
   * @memberof FolderService
   */
  async getTree(userId: number): Promise<TreeNodeDto> {
    const userRoot = await this.getUserRootFolder(userId);

    if (!userRoot) {
      // NOTE: or return forbidden exeption
      throw new NotFoundException('folder not found');
    }

    return this.getTreeRecursive(userRoot.id);
  }

  async copy(userId: number, dto: CopyFolderDto): Promise<void> {
    const folder = await this.prisma.folder.findUnique({
      where: { inviteCode: dto.inviteCode, active: true },
      include: { parent: true },
    });

    if (!folder) {
      throw new NotFoundException('folder not found');
    }

    if (!(await this.isOwner(userId, dto.parentId))) {
      throw new ForbiddenException('user is not owned');
    }

    await this.copyRecursive(userId, folder.id, dto.parentId);
  }

  async copyRecursive(
    userId: number,
    origFolderId: number,
    copyFolderId: number,
  ) {
    const items = await this.getItems(origFolderId);

    items.cards.forEach(async (card) => {
      await this.cardService.create(userId, {
        folderId: copyFolderId,
        word: card.word,
        translation: card.translation,
      });
    });

    items.folders.forEach(async (folder) => {
      const newFolder = await this.create(userId, {
        folderId: copyFolderId,
        title: folder.title,
      });

      this.copyRecursive(userId, folder.id, newFolder.id);
    });
  }

  private async getItems(folderId: number): Promise<GetItemDto> {
    const cards = await this.cardService.getAllInGroup(folderId);
    const folders = await this.getChildren(folderId);

    return {
      cards,
      folders,
    };
  }

  private async isOwner(userId: number, folderId: number) {
    const folderUser = await this.prisma.folderUser.findFirst({
      where: {
        userId,
        folderId,
        owned: true,
      },
    });

    return folderUser != null;
  }

  private async getChildren(parentFolderId: number): Promise<GetFolderDto[]> {
    return (
      await this.prisma.folder.findMany({
        where: { parent: { id: parentFolderId }, active: true },
      })
    ).map((folder) => this.getFolderDto(folder));
  }

  private async getTreeRecursive(rootFolderId: number): Promise<TreeNodeDto> {
    const folder = await this.prisma.folder.findUnique({
      where: { id: rootFolderId, active: true },
    });

    if (!folder) {
      throw new NotFoundException('folder not found');
    }

    const children = await this.getChildren(rootFolderId);

    const nodes = await Promise.all(
      children.map(async (child) => {
        return await this.getTreeRecursive(child.id);
      }),
    );

    return {
      root: this.getFolderDto(folder),
      children: nodes,
    };
  }

  private getFolderDto(folder: Folder): GetFolderDto {
    return {
      id: folder.id,
      title: folder.title,
      parentId: folder.parentId,
      inviteCode: folder.inviteCode,
    };
  }
}
