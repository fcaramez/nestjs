import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
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

      const payload = await this.signToken(newUser.id, newUser.email);

      console.log(payload);

      return {
        ...newUser,
        authToken: payload,
        message: 'Welcome back!',
        success: true,
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
          message: 'Wrong Credentials',
          success: false,
          statusCode: 403,
        });
      }

      const pwMatches = await argon.verify(user.hash, password);

      if (!pwMatches) {
        // noinspection ExceptionCaughtLocallyJS
        throw new ForbiddenException({
          message: 'Wrong Credentials',
          success: false,
          statusCode: 403,
        });
      }
      delete user.hash;

      const payload = await this.signToken(user.id, user.email);

      return {
        ...user,
        authToken: payload,
        message: 'Welcome back!',
        success: true,
      };
    } catch (err) {
      throw err;
    }
  }

  signToken(userId: number, email: string): Promise<string> {
    const payload = {
      userId,
      email,
    };

    return this.jwt.signAsync(payload, {
      expiresIn: '12h',
      secret: this.config.get('JWT_SECRET'),
    });
  }
}
