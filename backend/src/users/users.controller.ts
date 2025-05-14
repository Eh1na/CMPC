import { Controller, Post, Body, UseGuards, Get, Request, Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { LoginUserDto } from './dto/login-user.dto';
import { Public } from './decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }



  @ApiOperation({ summary: 'Inicio de sesion de Usuario' })

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string' },
        password: { type: 'string' },
      },
    },
  })

  @ApiResponse({ status: 201, description: 'Login Exitoso, devuelve un access_token' })
  @ApiResponse({ status: 401, description: 'Credenciales invalidas' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  @Public()
  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) response: Response
  ) {
    const { access_token, user } = await this.usersService.login(loginUserDto);

    response.cookie('access_token', access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 3600 * 1000,
      path: '/',
      domain: process.env.COOKIE_DOMAIN
    });

    return { user };
  }

}