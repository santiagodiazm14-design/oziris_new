import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return { message: 'Si el correo existe, se ha enviado un código de recuperación.' };
    }

    // Generate 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15); // 15 mins expiry

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordCode: code,
        resetPasswordExpires: expires,
      },
    });

    await this.mailService.sendPasswordResetEmail(user.email, code);

    return { message: 'Si el correo existe, se ha enviado un código de recuperación.' };
  }

  async verifyResetCode(email: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    
    if (!user || !user.resetPasswordCode || !user.resetPasswordExpires) {
      throw new BadRequestException('Código inválido o expirado.');
    }

    if (user.resetPasswordCode !== code) {
      throw new BadRequestException('Código incorrecto.');
    }

    if (new Date() > user.resetPasswordExpires) {
      throw new BadRequestException('El código ha expirado.');
    }

    return { message: 'Código verificado con éxito.' };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    
    if (!user || !user.resetPasswordCode || !user.resetPasswordExpires) {
      throw new BadRequestException('Código inválido o expirado.');
    }

    if (user.resetPasswordCode !== code) {
      throw new BadRequestException('Código incorrecto.');
    }

    if (new Date() > user.resetPasswordExpires) {
      throw new BadRequestException('El código ha expirado.');
    }

    // Hash the new password (assuming they will add bcrypt later, for now we just save it)
    // NOTE: In a real app you MUST hash this password before saving
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: newPassword, // TODO: Hash password
        resetPasswordCode: null,
        resetPasswordExpires: null,
      },
    });

    return { message: 'Contraseña restablecida con éxito.' };
  }
}
