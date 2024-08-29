import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { usersDTO } from './DTO/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(username: string): Promise<any> {
    return this.userModel.findOne({ username }).exec();
  }

  async create(createUserDto: usersDTO): Promise<User> {
    if (!createUserDto.role) {
      createUserDto.role = 'guest';
    }
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
  }
}
