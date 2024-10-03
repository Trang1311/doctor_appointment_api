import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { usersDTO } from './DTO/user.dto';
import { AuthService } from '../auth/auth.service';
import { UpdateUserDto } from './DTO/updateuser.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject(forwardRef(() => AuthService)) private authService: AuthService,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(username: string): Promise<User | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async create(createUserDto: usersDTO): Promise<User> {
    if (!createUserDto.role) {
      createUserDto.role = 'guest';
    }
    const hashedPassword = await this.authService.hashPassword(
      createUserDto.password,
    );
    createUserDto.password = hashedPassword;
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    if (updateUserDto.password) {
      const hashedPassword = await this.authService.hashPassword(
        updateUserDto.password,
      );
      updateUserDto.password = hashedPassword;
    }
    if (updateUserDto.image) {
      updateUserDto.imageURL = updateUserDto.image.path;
    }
    Object.assign(user, updateUserDto);
    return user.save();
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async createOrUpdateFromGoogle(profile: any): Promise<User> {
    const { email, name } = profile;
    let user = await this.findOneByEmail(email);

    if (!user) {
      user = new this.userModel({
        name: name,
        username: email,
        email,
        role: 'guest',
      });
      await user.save();
    } else {
      user.username = email;
      await user.save();
    }
    return user;
  }
}
