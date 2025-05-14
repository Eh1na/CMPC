import { Injectable, Inject, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_REPOSITORY')
    @InjectModel(User)
    private userModel: typeof User,
    private jwtService: JwtService,
  ) { }

  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.userModel.findOne({
      where: { username: createUserDto.username }
    });

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const user = await this.userModel.create({
      username: createUserDto.username,
      password: createUserDto.password
    });

    await user.save();

    return {
      id: user.id,
      username: user.username,
      message: 'User registered successfully'
    };
  }


  async login(loginUserDto: LoginUserDto) {
    const user = await this.validateUser(loginUserDto.username, loginUserDto.password);
    return this.generateToken(user);
  }


  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.userModel.findOne({
      where: { username }
    });

    if (!user || !(await user.validatePassword(password))) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    return user;
  }


  private async generateToken(user: User) {
    const payload = {
      sub: user.id,
      username: user.username
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username
      }
    };
  }


  async findByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ where: { username } });
  }

  async findById(id: number): Promise<User> {
    const user = await this.userModel.findByPk(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

}