import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './login.dto';
import * as bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }
  async comparePasswords(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    console.log('User retrieved from DB:', user);

    if (!user) {
      console.log('User not found');
      return null;
    }

    const isMatch = await this.comparePasswords(password, user.password);
    if (isMatch) {
      const { password, ...result } = user;
      return result;
    }

    console.log('Invalid password');
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException();
    }
    const payload = {
      username: user.username,
      sub: user.userId,
      role: user.role,
      _id: user._id,
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user: user._doc,
    };
  }

  async validateGoogleUser(profile: any): Promise<any> {
    const { email, name, photos } = profile;
    let user = await this.usersService.findOneByEmail(email);

    if (!user) {
      user = await this.usersService.create({
        name: name,
        username: email,
        password: '',
        email,
        role: 'guest',
        imageURL: photos[0].value,
      });
    }
    const { password, ...result } = user;
    return result;
  }

  async loginWithGoogle(profile: any) {
    const user = await this.usersService.createOrUpdateFromGoogle(profile);
    if (!user) {
      throw new UnauthorizedException();
    }
    const payload = {
      username: user.username,
      sub: user._id,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user: user,
    };
  }

  async verifyGoogleToken(tokenId: string): Promise<any> {
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
  }
}
