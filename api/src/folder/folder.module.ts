import { Module } from '@nestjs/common';
import { FolderController } from './folder.controller';
import { FolderService } from './folder.service';
import { CardModule } from 'src/card/card.module';

@Module({
  controllers: [FolderController],
  providers: [FolderService],
  imports: [CardModule],
})
export class FolderModule {}
