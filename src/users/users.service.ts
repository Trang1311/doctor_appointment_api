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
import { randomInt } from 'crypto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject(forwardRef(() => AuthService)) private authService: AuthService,
    private readonly mailerService: MailerService,
  ) {}
  private verificationCodes: Map<string, number> = new Map();
  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(username: string): Promise<User | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findByUsernameOrName(searchTerm: string): Promise<User | null> {
    return this.userModel
      .findOne({
        $or: [{ username: searchTerm }, { name: searchTerm }],
      })
      .exec();
  }
  async findUserbyId(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
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
      throw new NotFoundException(`Người dùng với ID ${id} không tìm thấy`);
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
  async sendVerificationCode(userId: string): Promise<void> {
    const user = await this.findUserbyId(userId);
    if (!user) {
      throw new NotFoundException(`Người dùng với ID ${userId} không tồn tại`);
    }
    const code = randomInt(100000, 999999);
    user.verificationCode = code;
    user.verificationCodeExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Mã xác thực để đổi mật khẩu',
        template: './verification',
        context: {
          username: user.username,
          code,
        },
      });
      console.log(`Verification email sent to ${user.email}`);
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new BadRequestException('Không thể gửi email xác thực');
    }
  }

  async verifyAndChangePassword(
    userId: string,
    code: number,
    newPassword: string,
  ): Promise<void> {
    const user = await this.findUserbyId(userId);
    if (!user) {
      throw new NotFoundException(`Người dùng với ID ${userId} không tồn tại`);
    }
    if (!user.verificationCode || user.verificationCode !== code) {
      throw new BadRequestException('Mã xác thực không chính xác');
    }
    if (
      user.verificationCodeExpiry &&
      user.verificationCodeExpiry < new Date()
    ) {
      throw new BadRequestException('Mã xác thực đã hết hạn');
    }
    const hashedPassword = await this.authService.hashPassword(newPassword);
    user.password = hashedPassword;
    user.verificationCode = null;
    user.verificationCodeExpiry = null;
    await user.save();

    console.log('Password updated successfully');
  }
  async remove(id: string): Promise<void> {
    const result = await this.userModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Người dụng với ID ${id} không tìm thấy`);
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
