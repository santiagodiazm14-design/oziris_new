import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomInt, timingSafeEqual } from 'crypto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';

const MAX_RESET_ATTEMPTS = 5;
const RESET_TTL_MS = 15 * 60 * 1000;
const GENERIC_FORGOT_MSG =
  'Si el correo está registrado en Oziris, recibirás un código de recuperación.';
// Hash de relleno para igualar el tiempo de respuesta cuando el usuario no existe
const DUMMY_HASH = bcrypt.hashSync('dummy-password-for-timing', 10);

const sha256 = (v: string) => createHash('sha256').update(v).digest('hex');
const safeEqual = (a: string, b: string) => {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
};

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(data: {
    name: string;
    email: string;
    password: string;
    accountType?: 'USER' | 'ARTIST';
    artisticName?: string;
    genre?: string;
  }) {
    if (!data.name?.trim() || !data.email || !data.password) {
      throw new BadRequestException('Todos los campos son obligatorios.');
    }
    if (data.password.length < 6) {
      throw new BadRequestException(
        'La contraseña debe tener al menos 6 caracteres.',
      );
    }

    const isArtist = data.accountType === 'ARTIST';
    // Nunca se asigna ADMIN desde el registro público
    const assignedRole = isArtist ? 'PRODUCER' : 'USER';

    const newUser = await this.usersService.createUser({
      name: data.name,
      email: data.email,
      password: data.password,
      role: assignedRole,
      artisticName: isArtist
        ? data.artisticName?.trim() || data.name.trim()
        : undefined,
      genre: isArtist ? data.genre?.trim() : undefined,
    });

    return {
      message: isArtist
        ? '¡Cuenta de Artista creada exitosamente!'
        : '¡Usuario registrado exitosamente!',
      access_token: this.generateToken(newUser.id, newUser.email, newUser.role),
      user: newUser,
    };
  }

  async login(data: { email: string; password: string }) {
    if (!data.email || !data.password) {
      throw new BadRequestException('Por favor ingrese correo y contraseña.');
    }

    const user = await this.usersService.findByEmailWithPassword(data.email);

    // Siempre se ejecuta bcrypt para no revelar por tiempo si el correo existe
    const isPasswordValid = await bcrypt.compare(
      data.password,
      user?.password ?? DUMMY_HASH,
    );
    if (!user || !isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }
    if (user.isActive === false) {
      throw new ForbiddenException(
        'Esta cuenta se encuentra desactivada. Contacte al administrador.',
      );
    }

    const fullUser = await this.usersService.findById(user.id);
    return {
      message: 'Inicio de sesión exitoso.',
      access_token: this.generateToken(user.id, user.email, user.role),
      user: fullUser,
    };
  }

  async getProfile(userId: string) {
    return this.usersService.findById(userId);
  }

  private generateToken(userId: string, email: string, role: string): string {
    return this.jwtService.sign({ sub: userId, email, role });
  }

  async forgotPassword(email: string, ipAddress?: string) {
    const cleanEmail = email?.trim().toLowerCase();
    if (!cleanEmail) {
      throw new BadRequestException('Debes ingresar un correo electrónico.');
    }

    const user = await this.usersService.findByEmailWithPassword(cleanEmail);
    if (!user || user.isActive === false) {
      return { message: GENERIC_FORGOT_MSG };
    }

    // Código de 6 dígitos con generador criptográficamente seguro
    const code = randomInt(100000, 1000000).toString();

    await this.prisma.$transaction([
      this.prisma.passwordReset.updateMany({
        where: { email: cleanEmail, used: false },
        data: { used: true },
      }),
      this.prisma.passwordReset.create({
        data: {
          email: cleanEmail,
          // Solo se guarda el hash: una fuga de BD no expone códigos válidos
          code: sha256(code),
          expiresAt: new Date(Date.now() + RESET_TTL_MS),
          userId: user.id,
          attempts: 0,
          used: false,
          ipAddress: ipAddress ? String(ipAddress).slice(0, 64) : null,
        },
      }),
    ]);

    await this.mailService.sendPasswordResetEmail(user.email, code);
    // No se devuelve el email para no confirmar si existe la cuenta
    return { message: GENERIC_FORGOT_MSG };
  }

  /**
   * Valida un código contra el último registro vigente. Cada fallo suma un
   * intento (aplica tanto a verify como a reset); a los 5 el código se invalida.
   */
  private async checkResetCode(email: string, code: string) {
    const record = await this.prisma.passwordReset.findFirst({
      where: { email, used: false },
      orderBy: { createdAt: 'desc' },
    });
    if (!record) {
      throw new BadRequestException(
        'Código inválido o ya utilizado. Solicita uno nuevo.',
      );
    }
    if (new Date() > record.expiresAt) {
      await this.prisma.passwordReset.update({
        where: { id: record.id },
        data: { used: true },
      });
      throw new BadRequestException(
        'El código ha expirado (validez de 15 minutos). Por favor solicita uno nuevo.',
      );
    }
    if (record.attempts >= MAX_RESET_ATTEMPTS) {
      await this.prisma.passwordReset.update({
        where: { id: record.id },
        data: { used: true },
      });
      throw new BadRequestException(
        'Has superado el número máximo de intentos permitidos. Solicita un nuevo código por seguridad.',
      );
    }
    if (!safeEqual(record.code, sha256(code))) {
      const nextAttempts = record.attempts + 1;
      await this.prisma.passwordReset.update({
        where: { id: record.id },
        data: {
          attempts: nextAttempts,
          used: nextAttempts >= MAX_RESET_ATTEMPTS,
        },
      });
      const remaining = MAX_RESET_ATTEMPTS - nextAttempts;
      if (remaining <= 0) {
        throw new BadRequestException(
          'Código incorrecto. Has agotado tus intentos. Por seguridad solicita un nuevo código.',
        );
      }
      throw new BadRequestException(
        `El código ingresado es incorrecto. Te ${remaining === 1 ? 'queda 1 intento' : `quedan ${remaining} intentos`}.`,
      );
    }
    return record;
  }

  async verifyResetCode(email: string, code: string) {
    const cleanEmail = email?.trim().toLowerCase();
    const cleanCode = code?.trim();
    if (!cleanEmail || !cleanCode) {
      throw new BadRequestException('Por favor proporciona correo y código.');
    }
    await this.checkResetCode(cleanEmail, cleanCode);
    return { message: 'Código verificado con éxito.' };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const cleanEmail = email?.trim().toLowerCase();
    const cleanCode = code?.trim();
    if (!cleanEmail || !cleanCode || !newPassword) {
      throw new BadRequestException('Todos los campos son obligatorios.');
    }
    if (newPassword.length < 6) {
      throw new BadRequestException(
        'La nueva contraseña debe tener al menos 6 caracteres.',
      );
    }

    const record = await this.checkResetCode(cleanEmail, cleanCode);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: {
          password: hashedPassword,
          resetPasswordCode: null,
          resetPasswordExpires: null,
        },
      }),
      // Se invalidan todos los códigos pendientes de ese correo
      this.prisma.passwordReset.updateMany({
        where: { email: cleanEmail, used: false },
        data: { used: true, usedAt: new Date() },
      }),
    ]);

    return {
      message:
        'Contraseña restablecida con éxito. Ya puedes iniciar sesión con tu nueva contraseña.',
    };
  }

  async changePassword(
    userId: string,
    email: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user || user.id !== userId) {
      throw new UnauthorizedException('Sesión inválida.');
    }
    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) {
      throw new BadRequestException('La contraseña actual es incorrecta.');
    }
    if (currentPassword === newPassword) {
      throw new BadRequestException(
        'La nueva contraseña debe ser distinta a la actual.',
      );
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });
    return { message: 'Contraseña actualizada correctamente.' };
  }
}
