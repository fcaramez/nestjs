import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: {
    userId: number;
    email: string;
    iat: number;
    exp: number;
  }) {
    const { userId } = payload;
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        hash: false,
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        bookmarks: true,
      },
    });

    return { ...user };
  }
}
