import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { createReadStream, promises as fs, ReadStream } from 'fs';

@Injectable()
export class ImageService {
  async download(imageUrl: string): Promise<ReadStream> {
    const imageDir = process.env.IMAGE_DIR;

    const filepath = `${imageDir}/${imageUrl}`;

    if (!(await this.fileExists(filepath))) {
      throw new NotFoundException('file not found');
    }

    return createReadStream(`${imageDir}/${imageUrl}`);
  }

  async upload(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('file not requested');
    }

    const filename = uuidv4();
    const imageDir = process.env.IMAGE_DIR;

    await fs.writeFile(`${imageDir}/${filename}`, file.buffer);

    return filename;
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath, fs.constants.F_OK);
      return true;
    } catch (err) {
      return false;
    }
  }
}
