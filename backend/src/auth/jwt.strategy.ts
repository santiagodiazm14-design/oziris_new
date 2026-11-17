import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { getJwtSecret } from '../common/env';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(),
      algorithms: ['HS256'],
    });
  }

  /**
   * El rol y el estado se leen de la BD en cada petición: si un admin
   * desactiva, elimina o cambia de rol a un usuario, el token deja de
   * servir de inmediato (sin esperar a que expire).
   */
  async validate(payload: { sub: string; email: string; role: string }) {
    if (!payload?.sub) {
      throw new UnauthorizedException('Token inválido.');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, isActive: true },
    });
    if (!user || user.isActive === false) {
      throw new UnauthorizedException('Sesión inválida o cuenta desactivada.');
    }
    return { id: user.id, email: user.email, role: user.role };
  }
}
