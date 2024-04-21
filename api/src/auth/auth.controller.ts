import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from 'src/common/decorators/public.decorator';
import { RtGuard } from '../common/guards';
import { GetCurrentUser } from '../common/decorators';
import { Tokens } from './types';
import { SingInDto, SingUpDto } from './dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Регистрирует пользователя' })
  @Public()
  @Post('local/signup')
  @HttpCode(HttpStatus.CREATED)
  signUpLocal(@Body() dto: SingUpDto): Promise<Tokens> {
    return this.authService.signUpLocal(dto);
  }

  @ApiOperation({ summary: 'Авторизует пользователя' })
  @Public()
  @Post('local/signin')
  @HttpCode(HttpStatus.OK)
  signInLocal(@Body() dto: SingInDto): Promise<Tokens> {
    return this.authService.signInLocal(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Выход пользователя из аккаунта',
  })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@GetCurrentUser('sub') userId: number): Promise<void> {
    return this.authService.logout(userId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновляет токены авторизации' })
  @HttpCode(HttpStatus.OK)
  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  refreshTokens(
    @GetCurrentUser('sub') userId: number,
    @GetCurrentUser('refreshToken') rt: string,
  ): Promise<Tokens> {
    return this.authService.refreshTokens(userId, rt);
  }
}
