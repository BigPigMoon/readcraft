import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LanguageService } from './language.service';
import { Public } from 'src/common/decorators';

@ApiBearerAuth()
@ApiTags('Language')
@Controller('language')
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @ApiOperation({
    summary: 'Получить все языки с которыми взаимодействует приложение',
  })
  @Get('/')
  @HttpCode(HttpStatus.OK)
  @Public()
  getLanguages(): Promise<string[]> {
    return this.languageService.getLanguages();
  }
}
