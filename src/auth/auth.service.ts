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
        message: 'Welcome, hope you enjoy your stay!',
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
  async login(dto: AuthDto) {
    const { email, password } = dto;

    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
        select: {
          email: true,
          id: true,
          hash: true,
        },
      });

      if (!user) {
        // noinspection ExceptionCaughtLocallyJS
        throw new ForbiddenException({
          message: 'Your email is incorrect.',
          success: false,
          statusCode: 403,
        });
      }

      const pwMatches = await argon.verify(user.hash, password);

      if (!pwMatches) {
        // noinspection ExceptionCaughtLocallyJS
        throw new ForbiddenException({
          message: 'Your password is incorrect.',
        });
      }
      delete user.hash;

      return {
        ...user,
        message: 'Welcome back!',
        success: true,
      };
    } catch (err) {
      throw err;
    }
  }
}
