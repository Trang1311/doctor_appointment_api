import {
  Controller,
  Request,
  Post,
  UseGuards,
  Body,
  Get,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './login.dto';
import { ApiTags } from '@nestjs/swagger';
import { GoogleAuthGuard } from './google-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleLogin(@Req() req) {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req, @Res() res) {
    const user = req.user;
    const result = await this.authService.loginWithGoogle(user);
    res.redirect(`/profile?access_token=${result.access_token}`);
  }

  @Post('login/google')
  async loginWithGoogle(@Body() body: { tokenId: string }) {
    const profile = await this.authService.verifyGoogleToken(body.tokenId);
    return this.authService.loginWithGoogle(profile);
  }
}
