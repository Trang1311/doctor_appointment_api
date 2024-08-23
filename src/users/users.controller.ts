import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { usersDTO } from './DTO/user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
