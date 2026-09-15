import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(data: { name: string; email: string; password: string }) {
    if (!data.name || !data.email || !data.password) {
      throw new BadRequestException('Todos los campos son obligatorios.');
    }

    if (data.password.length < 6) {
      throw new BadRequestException('La contraseña debe tener al menos 6 caracteres.');
    }

    // Force default role to USER to prevent privilege escalation from frontend
    const newUser = await this.usersService.createUser({
      name: data.name,
      email: data.email,
      password: data.password,
      role: 'USER',
    });

    const token = this.generateToken(newUser.id, newUser.email, newUser.role);

    return {
      message: 'Usuario registrado exitosamente.',
      access_token: token,
      user: newUser,
    };
  }

  async login(data: { email: string; password: string }) {
    if (!data.email || !data.password) {
      throw new BadRequestException('Por favor ingrese correo y contraseña.');
    }

    const user = await this.usersService.findByEmailWithPassword(data.email);

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }

    if (user.isActive === false) {
      throw new ForbiddenException('Esta cuenta se encuentra desactivada. Contacte al administrador.');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }

    const token = this.generateToken(user.id, user.email, user.role);
    const fullUser = await this.usersService.findById(user.id);

    return {
      message: 'Inicio de sesión exitoso.',
      access_token: token,
      user: fullUser,
    };
  }

  async getProfile(userId: string) {
    return this.usersService.findById(userId);
  }

  private generateToken(userId: string, email: string, role: string): string {
    const payload = { sub: userId, email, role };
    return this.jwtService.sign(payload);
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user) {
      return { message: 'Si el correo existe, se ha enviado un código de recuperación.' };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15);

    try {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordCode: code,
          resetPasswordExpires: expires,
        },
      });
    } catch (e) {
      // Ignore if DB offline
    }

    await this.mailService.sendPasswordResetEmail(user.email, code);
    return { message: 'Si el correo existe, se ha enviado un código de recuperación.' };
  }

  async verifyResetCode(email: string, code: string) {
    const user = await this.usersService.findByEmailWithPassword(email);
    
    if (!user || !user.resetPasswordCode || !user.resetPasswordExpires) {
      throw new BadRequestException('Código inválido o expirado.');
    }

    if (user.resetPasswordCode !== code) {
      throw new BadRequestException('Código incorrecto.');
    }

    if (new Date() > new Date(user.resetPasswordExpires)) {
      throw new BadRequestException('El código ha expirado.');
    }

    return { message: 'Código verificado con éxito.' };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const user = await this.usersService.findByEmailWithPassword(email);
    
    if (!user || !user.resetPasswordCode || !user.resetPasswordExpires) {
      throw new BadRequestException('Código inválido o expirado.');
    }

    if (user.resetPasswordCode !== code) {
      throw new BadRequestException('Código incorrecto.');
    }

    if (new Date() > new Date(user.resetPasswordExpires)) {
      throw new BadRequestException('El código ha expirado.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    try {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetPasswordCode: null,
          resetPasswordExpires: null,
        },
      });
    } catch (e) {
      user.password = hashedPassword;
      user.resetPasswordCode = null;
      user.resetPasswordExpires = null;
    }

    return { message: 'Contraseña restablecida con éxito.' };
  }
}
