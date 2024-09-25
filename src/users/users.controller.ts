import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Put,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { usersDTO } from './DTO/user.dto';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';
import { OAuth2Client } from 'google-auth-library';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { UpdateUserDto } from './DTO/updateuser.dto';
import { storage } from 'src/cloudinary/cloudinary.storage';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('create')
  async create(@Body() createUserDto: usersDTO) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':username')
  async findOne(@Param('username') username: string) {
    return this.usersService.findOne(username);
  }

  @Put('update/:id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image', { storage: storage }))
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    if (file) {
      updateUserDto.image = file;
    }
    return this.usersService.update(id, updateUserDto);
  }
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post('login/google')
  async googleLogin(@Body() body: { tokenId: string }) {
    const profile = await this.verifyGoogleToken(body.tokenId);
    const result = await this.authService.loginWithGoogle(profile);
    return result;
  }

  private async verifyGoogleToken(tokenId: string): Promise<any> {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
  }
}
