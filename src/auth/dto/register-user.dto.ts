import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { UserRoles } from '../entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ default: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ default: 'john@gmail.com' })
  @IsNotEmpty()
  @IsEmail({}, { message: "Email noto'g'ri formatda!" })
  email: string;

  @ApiProperty({ default: 'John123#' })
  @IsStrongPassword(
    {
      minLength: 6,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        "Parol kamida 6 ta belgi, 1 ta katta harf, 1 ta raqam va 1 ta maxsus belgi bo'lishi kerak!",
    },
  )
  password: string;

  @ApiProperty({ default: UserRoles.USER })
  @IsEnum(UserRoles, {
    message: "Rolda faqat 'admin' yoki 'user' bo'lishi kerak!",
  })
  role?: UserRoles;
}
