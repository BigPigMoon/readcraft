import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AtStrategy, RtStrategy } from './strategies';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FolderModule } from 'src/folder/folder.module';
import { BookModule } from 'src/book/book.module';
import { CourseModule } from 'src/course/course.module';

@Module({
  imports: [JwtModule.register({}), FolderModule, BookModule, CourseModule],
  controllers: [AuthController],
  providers: [AuthService, AtStrategy, RtStrategy],
})
export class AuthModule {}
