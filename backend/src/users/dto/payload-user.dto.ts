import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PayloadUserDto {
  @ApiProperty({ example: 'usuario@example.com' })
  @IsEmail()
  email: string;


  @ApiProperty({ example: 'Juan' })
  @IsNotEmpty()
  firstName: string;


}