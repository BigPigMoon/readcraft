import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from './common/guards';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { BookModule } from './book/book.module';
import { CardModule } from './card/card.module';
import { CourseModule } from './course/course.module';
import { FolderModule } from './folder/folder.module';
import { LanguageModule } from './language/language.module';
import { TranslatorModule } from './translator/translator.module';
import { LessonModule } from './lesson/lesson.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    BookModule,
    CardModule,
    CourseModule,
    FolderModule,
    LanguageModule,
    TranslatorModule,
    LessonModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: AtGuard }],
})
export class AppModule {}
