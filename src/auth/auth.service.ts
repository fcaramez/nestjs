import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async signup(dto: AuthDto) {
    const { email, password } = dto;
    const hashedPassword = await argon.hash(password);

    try {
      const newUser = await this.prisma.user.create({
        data: {
          email,
          hash: hashedPassword,
        },
        select: {
          email: true,
          id: true,
        },
      });

      return {
        ...newUser,
        success: true,
        message: 'Success',
      };
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new ForbiddenException({
            message: 'User already exists!',
            success: false,
          });
        }
      }
      throw err;
    }
  }
  login() {
    return 'I am Logging in';
  }
}
