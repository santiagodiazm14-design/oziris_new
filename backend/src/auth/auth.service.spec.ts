import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoginAttemptsService } from './login-attempts.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<Record<keyof UsersService, jest.Mock>>;
  let jwtService: Partial<Record<keyof JwtService, jest.Mock>>;
  let mailService: Partial<Record<keyof MailService, jest.Mock>>;
  let prismaService: any;

  beforeEach(async () => {
    usersService = {
      createUser: jest.fn(),
      findByEmailWithPassword: jest.fn(),
      findById: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    mailService = {
      sendPasswordResetEmail: jest
        .fn()
        .mockResolvedValue({ success: true, message: 'sent' }),
    };

    prismaService = {
      $transaction: jest
        .fn()
        .mockImplementation((ops: any[]) => Promise.all(ops)),
      passwordReset: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        create: jest.fn().mockResolvedValue({ id: 'reset-1' }),
        findFirst: jest.fn().mockResolvedValue(null),
        update: jest.fn().mockResolvedValue({}),
      },
      user: {
        update: jest.fn().mockResolvedValue({}),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: MailService, useValue: mailService },
        { provide: PrismaService, useValue: prismaService },
        LoginAttemptsService,
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('debe arrojar BadRequestException si faltan campos obligatorios', async () => {
      await expect(
        authService.register({
          name: '',
          email: 'test@mail.com',
          password: '123',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe arrojar BadRequestException si la contraseña tiene menos de 6 caracteres', async () => {
      await expect(
        authService.register({
          name: 'Test',
          email: 'test@mail.com',
          password: '123',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe registrar un usuario regular con rol USER', async () => {
      const mockCreatedUser = {
        id: 'u-1',
        name: 'Carlos',
        email: 'carlos@mail.com',
        role: 'USER',
      };
      (usersService.createUser as jest.Mock).mockResolvedValue(mockCreatedUser);

      const result = await authService.register({
        name: 'Carlos',
        email: 'carlos@mail.com',
        password: 'password123',
        accountType: 'USER',
      });

      expect(result).toHaveProperty('access_token', 'mock-jwt-token');
      expect(result.user).toEqual(mockCreatedUser);
      expect(usersService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'USER' }),
      );
    });

    it('debe registrar un artista con rol PRODUCER', async () => {
      const mockArtistUser = {
        id: 'u-2',
        name: 'Beatmaker Pro',
        email: 'artist@mail.com',
        role: 'PRODUCER',
      };
      (usersService.createUser as jest.Mock).mockResolvedValue(mockArtistUser);

      const result = await authService.register({
        name: 'Beatmaker Pro',
        email: 'artist@mail.com',
        password: 'password123',
        accountType: 'ARTIST',
        artisticName: 'Pro Beats',
        genre: 'Trap',
      });

      expect(result.message).toContain('Cuenta de Artista creada exitosamente');
      expect(usersService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'PRODUCER',
          artisticName: 'Pro Beats',
        }),
      );
    });
  });

  describe('login', () => {
    it('debe arrojar BadRequestException si no se envía email o password', async () => {
      await expect(
        authService.login({ email: '', password: '' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe arrojar UnauthorizedException si el usuario no existe', async () => {
      (usersService.findByEmailWithPassword as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(
        authService.login({
          email: 'noexiste@mail.com',
          password: '123456password',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe arrojar ForbiddenException si la cuenta está inactiva', async () => {
      (usersService.findByEmailWithPassword as jest.Mock).mockResolvedValue({
        id: 'u-inactive',
        email: 'inactive@mail.com',
        password: await bcrypt.hash('password123', 4),
        isActive: false,
      });

      await expect(
        authService.login({
          email: 'inactive@mail.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('debe arrojar UnauthorizedException si la contraseña no coincide', async () => {
      const hashedPassword = await bcrypt.hash('correctPassword', 10);
      (usersService.findByEmailWithPassword as jest.Mock).mockResolvedValue({
        id: 'u-active',
        email: 'active@mail.com',
        password: hashedPassword,
        isActive: true,
        role: 'USER',
      });

      await expect(
        authService.login({
          email: 'active@mail.com',
          password: 'wrongPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe retornar access_token y datos de usuario si credenciales son correctas', async () => {
      const plainPassword = 'correctPassword';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      const user = {
        id: 'u-valid',
        email: 'valid@mail.com',
        password: hashedPassword,
        isActive: true,
        role: 'USER',
      };
      (usersService.findByEmailWithPassword as jest.Mock).mockResolvedValue(
        user,
      );
      (usersService.findById as jest.Mock).mockResolvedValue({
        id: user.id,
        email: user.email,
      });

      const result = await authService.login({
        email: 'valid@mail.com',
        password: plainPassword,
      });

      expect(result).toHaveProperty('access_token', 'mock-jwt-token');
      expect(result.message).toBe('Inicio de sesión exitoso.');
    });
  });

  describe('login: bloqueo por intentos fallidos', () => {
    const wrong = (email = 'lock@mail.com') =>
      authService.login({ email, password: 'incorrecta' });

    beforeEach(async () => {
      (usersService.findByEmailWithPassword as jest.Mock).mockResolvedValue({
        id: 'u-lock',
        email: 'lock@mail.com',
        password: await bcrypt.hash('correctPassword', 4),
        isActive: true,
        role: 'USER',
      });
      (usersService.findById as jest.Mock).mockResolvedValue({ id: 'u-lock' });
    });

    it('avisa cuántos intentos quedan', async () => {
      await expect(wrong()).rejects.toThrow(/Te quedan 4 intentos/);
      await expect(wrong()).rejects.toThrow(/Te quedan 3 intentos/);
      await expect(wrong()).rejects.toThrow(/Te quedan 2 intentos/);
      await expect(wrong()).rejects.toThrow(/Te queda 1 intento/);
    });

    it('al quinto fallo responde 429 con los segundos de espera', async () => {
      for (let i = 0; i < 4; i++)
        await expect(wrong()).rejects.toThrow(UnauthorizedException);
      const err: any = await wrong().catch((e) => e);
      expect(err.getStatus()).toBe(429);
      expect(err.getResponse().retryAfter).toBe(60);
    });

    it('bloqueada, ni la clave correcta entra y ni se consulta la base de datos', async () => {
      for (let i = 0; i < 5; i++) await wrong().catch(() => undefined);
      (usersService.findByEmailWithPassword as jest.Mock).mockClear();
      const err: any = await authService
        .login({ email: 'LOCK@mail.com ', password: 'correctPassword' })
        .catch((e) => e);
      expect(err.getStatus()).toBe(429);
      expect(usersService.findByEmailWithPassword).not.toHaveBeenCalled();
    });

    it('otra cuenta no se ve afectada por el bloqueo', async () => {
      for (let i = 0; i < 5; i++) await wrong().catch(() => undefined);
      (usersService.findByEmailWithPassword as jest.Mock).mockResolvedValue({
        id: 'u-other',
        email: 'other@mail.com',
        password: await bcrypt.hash('otraClave', 4),
        isActive: true,
        role: 'USER',
      });
      await expect(
        authService.login({ email: 'other@mail.com', password: 'otraClave' }),
      ).resolves.toHaveProperty('access_token');
    });

    it('un inicio de sesión correcto reinicia el contador', async () => {
      for (let i = 0; i < 3; i++) await wrong().catch(() => undefined);
      await authService.login({
        email: 'lock@mail.com',
        password: 'correctPassword',
      });
      await expect(wrong()).rejects.toThrow(/Te quedan 4 intentos/);
    });

    it('también cuenta los correos que no existen (no revela cuentas)', async () => {
      (usersService.findByEmailWithPassword as jest.Mock).mockResolvedValue(
        null,
      );
      for (let i = 0; i < 4; i++)
        await wrong('fantasma@mail.com').catch(() => undefined);
      const err: any = await wrong('fantasma@mail.com').catch((e) => e);
      expect(err.getStatus()).toBe(429);
    });
  });

  describe('forgotPassword', () => {
    it('debe arrojar BadRequestException si el email está vacío', async () => {
      await expect(authService.forgotPassword('')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe retornar mensaje de protección de privacidad si el usuario no existe', async () => {
      (usersService.findByEmailWithPassword as jest.Mock).mockResolvedValue(
        null,
      );

      const result = await authService.forgotPassword('unknown@mail.com');
      expect(result.message).toContain(
        'Si el correo está registrado en Oziris',
      );
    });

    it('debe generar código y llamar a mailService si el usuario existe', async () => {
      (usersService.findByEmailWithPassword as jest.Mock).mockResolvedValue({
        id: 'u-1',
        email: 'user@mail.com',
      });

      const result = await authService.forgotPassword('user@mail.com');
      expect(result.message).toContain('Si el correo está registrado');
      // No debe revelar si la cuenta existe
      expect(result).not.toHaveProperty('email');
      expect(mailService.sendPasswordResetEmail).toHaveBeenCalled();

      // El código se envía por correo pero en BD solo se guarda su hash
      const sentCode = (mailService.sendPasswordResetEmail as jest.Mock).mock
        .calls[0][1];
      expect(sentCode).toMatch(/^\d{6}$/);
      const stored =
        prismaService.passwordReset.create.mock.calls[0][0].data.code;
      expect(stored).not.toBe(sentCode);
      expect(stored).toHaveLength(64);
    });
  });

  describe('resetPassword / verifyResetCode', () => {
    const sha = (v: string) =>
      require('crypto').createHash('sha256').update(v).digest('hex');
    const record = (over: any = {}) => ({
      id: 'r1',
      userId: 'u1',
      code: sha('123456'),
      attempts: 0,
      used: false,
      expiresAt: new Date(Date.now() + 60_000),
      ...over,
    });

    it('un código incorrecto suma un intento', async () => {
      prismaService.passwordReset.findFirst.mockResolvedValue(record());
      await expect(
        authService.verifyResetCode('a@b.co', '000000'),
      ).rejects.toThrow(BadRequestException);
      expect(prismaService.passwordReset.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { attempts: 1, used: false } }),
      );
    });

    it('resetPassword TAMBIÉN cuenta intentos fallidos (anti fuerza bruta)', async () => {
      prismaService.passwordReset.findFirst.mockResolvedValue(
        record({ attempts: 4 }),
      );
      await expect(
        authService.resetPassword('a@b.co', '000000', 'NuevaClave1'),
      ).rejects.toThrow(BadRequestException);
      expect(prismaService.passwordReset.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { attempts: 5, used: true } }),
      );
      expect(prismaService.user.update).not.toHaveBeenCalled();
    });

    it('rechaza un código expirado', async () => {
      prismaService.passwordReset.findFirst.mockResolvedValue(
        record({ expiresAt: new Date(Date.now() - 1000) }),
      );
      await expect(
        authService.resetPassword('a@b.co', '123456', 'NuevaClave1'),
      ).rejects.toThrow(/expirado/);
    });

    it('con el código correcto cambia la contraseña y consume los códigos', async () => {
      prismaService.passwordReset.findFirst.mockResolvedValue(record());
      const res = await authService.resetPassword(
        'A@B.co',
        '123456',
        'NuevaClave1',
      );
      expect(res.message).toMatch(/restablecida/);
      expect(prismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'u1' } }),
      );
      expect(prismaService.passwordReset.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { email: 'a@b.co', used: false } }),
      );
    });
  });

  describe('changePassword', () => {
    it('cambia la contraseña cuando la actual es correcta', async () => {
      const hashed = await bcrypt.hash('Actual123!', 4);
      usersService.findByEmailWithPassword!.mockResolvedValue({
        id: 'u1',
        email: 'a@b.co',
        password: hashed,
      });
      const res = await authService.changePassword(
        'u1',
        'a@b.co',
        'Actual123!',
        'Nueva456!',
      );
      expect(res.message).toMatch(/actualizada/i);
      expect(prismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'u1' } }),
      );
    });

    it('rechaza si la contraseña actual es incorrecta', async () => {
      const hashed = await bcrypt.hash('Actual123!', 4);
      usersService.findByEmailWithPassword!.mockResolvedValue({
        id: 'u1',
        email: 'a@b.co',
        password: hashed,
      });
      await expect(
        authService.changePassword('u1', 'a@b.co', 'Incorrecta', 'Nueva456!'),
      ).rejects.toThrow(BadRequestException);
    });

    it('rechaza si el token pertenece a otro usuario', async () => {
      usersService.findByEmailWithPassword!.mockResolvedValue({
        id: 'otro',
        email: 'a@b.co',
        password: 'x',
      });
      await expect(
        authService.changePassword('u1', 'a@b.co', 'a', 'Nueva456!'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
