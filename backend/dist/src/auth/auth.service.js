"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const mail_service_1 = require("../mail/mail.service");
const users_service_1 = require("../users/users.service");
const bcrypt = __importStar(require("bcryptjs"));
let AuthService = class AuthService {
    prisma;
    mailService;
    usersService;
    jwtService;
    constructor(prisma, mailService, usersService, jwtService) {
        this.prisma = prisma;
        this.mailService = mailService;
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async register(data) {
        if (!data.name || !data.email || !data.password) {
            throw new common_1.BadRequestException('Todos los campos son obligatorios.');
        }
        if (data.password.length < 6) {
            throw new common_1.BadRequestException('La contraseña debe tener al menos 6 caracteres.');
        }
        const isArtist = data.accountType === 'ARTIST';
        const assignedRole = isArtist ? 'PRODUCER' : 'USER';
        const newUser = await this.usersService.createUser({
            name: data.name,
            email: data.email,
            password: data.password,
            role: assignedRole,
            artisticName: isArtist ? (data.artisticName?.trim() || data.name.trim()) : undefined,
            genre: isArtist ? data.genre?.trim() : undefined,
        });
        const token = this.generateToken(newUser.id, newUser.email, newUser.role);
        return {
            message: isArtist
                ? '¡Cuenta de Artista creada exitosamente!'
                : '¡Usuario registrado exitosamente!',
            access_token: token,
            user: newUser,
        };
    }
    async login(data) {
        if (!data.email || !data.password) {
            throw new common_1.BadRequestException('Por favor ingrese correo y contraseña.');
        }
        const user = await this.usersService.findByEmailWithPassword(data.email);
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciales incorrectas.');
        }
        if (user.isActive === false) {
            throw new common_1.ForbiddenException('Esta cuenta se encuentra desactivada. Contacte al administrador.');
        }
        const isPasswordValid = await bcrypt.compare(data.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Credenciales incorrectas.');
        }
        const token = this.generateToken(user.id, user.email, user.role);
        const fullUser = await this.usersService.findById(user.id);
        return {
            message: 'Inicio de sesión exitoso.',
            access_token: token,
            user: fullUser,
        };
    }
    async getProfile(userId) {
        return this.usersService.findById(userId);
    }
    generateToken(userId, email, role) {
        const payload = { sub: userId, email, role };
        return this.jwtService.sign(payload);
    }
    async forgotPassword(email, ipAddress) {
        const cleanEmail = email?.trim().toLowerCase();
        if (!cleanEmail) {
            throw new common_1.BadRequestException('Debes ingresar un correo electrónico.');
        }
        const user = await this.usersService.findByEmailWithPassword(cleanEmail);
        if (!user) {
            return { message: 'Si el correo está registrado en Oziris, recibirás un código de recuperación.' };
        }
        try {
            await this.prisma.passwordReset.updateMany({
                where: {
                    email: cleanEmail,
                    used: false,
                },
                data: {
                    used: true,
                },
            });
        }
        catch (e) {
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        try {
            await this.prisma.passwordReset.create({
                data: {
                    email: cleanEmail,
                    code,
                    expiresAt,
                    userId: user.id,
                    attempts: 0,
                    used: false,
                    ipAddress: ipAddress || null,
                },
            });
            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    resetPasswordCode: code,
                    resetPasswordExpires: expiresAt,
                },
            });
        }
        catch (e) {
            user.resetPasswordCode = code;
            user.resetPasswordExpires = expiresAt;
        }
        await this.mailService.sendPasswordResetEmail(user.email, code);
        return {
            message: 'Si el correo está registrado en Oziris, recibirás un código de recuperación.',
            email: cleanEmail,
        };
    }
    async verifyResetCode(email, code) {
        const cleanEmail = email?.trim().toLowerCase();
        const cleanCode = code?.trim();
        if (!cleanEmail || !cleanCode) {
            throw new common_1.BadRequestException('Por favor proporciona correo y código.');
        }
        let resetRecord = null;
        try {
            resetRecord = await this.prisma.passwordReset.findFirst({
                where: {
                    email: cleanEmail,
                    used: false,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
        }
        catch (e) {
        }
        if (!resetRecord) {
            const user = await this.usersService.findByEmailWithPassword(cleanEmail);
            if (!user || !user.resetPasswordCode || !user.resetPasswordExpires) {
                throw new common_1.BadRequestException('Código inválido o ya utilizado. Solicita uno nuevo.');
            }
            if (user.resetPasswordCode !== cleanCode) {
                throw new common_1.BadRequestException('El código ingresado es incorrecto.');
            }
            if (new Date() > new Date(user.resetPasswordExpires)) {
                throw new common_1.BadRequestException('El código ha expirado (validez de 15 minutos). Por favor solicita uno nuevo.');
            }
            return { message: 'Código verificado con éxito.' };
        }
        if (new Date() > new Date(resetRecord.expiresAt)) {
            try {
                await this.prisma.passwordReset.update({
                    where: { id: resetRecord.id },
                    data: { used: true },
                });
            }
            catch (_) { }
            throw new common_1.BadRequestException('El código ha expirado (validez de 15 minutos). Por favor solicita uno nuevo.');
        }
        if (resetRecord.attempts >= 5) {
            try {
                await this.prisma.passwordReset.update({
                    where: { id: resetRecord.id },
                    data: { used: true },
                });
            }
            catch (_) { }
            throw new common_1.BadRequestException('Has superado el número máximo de intentos permitidos. Solicita un nuevo código por seguridad.');
        }
        if (resetRecord.code !== cleanCode) {
            const nextAttempts = resetRecord.attempts + 1;
            try {
                await this.prisma.passwordReset.update({
                    where: { id: resetRecord.id },
                    data: {
                        attempts: nextAttempts,
                        used: nextAttempts >= 5,
                    },
                });
            }
            catch (_) { }
            const remaining = 5 - nextAttempts;
            if (remaining <= 0) {
                throw new common_1.BadRequestException('Código incorrecto. Has agotado tus intentos. Por seguridad solicita un nuevo código.');
            }
            throw new common_1.BadRequestException(`El código ingresado es incorrecto. Te ${remaining === 1 ? 'queda 1 intento' : `quedan ${remaining} intentos`}.`);
        }
        return { message: 'Código verificado con éxito.' };
    }
    async resetPassword(email, code, newPassword) {
        const cleanEmail = email?.trim().toLowerCase();
        const cleanCode = code?.trim();
        if (!cleanEmail || !cleanCode || !newPassword) {
            throw new common_1.BadRequestException('Todos los campos son obligatorios.');
        }
        if (newPassword.length < 6) {
            throw new common_1.BadRequestException('La nueva contraseña debe tener al menos 6 caracteres.');
        }
        const user = await this.usersService.findByEmailWithPassword(cleanEmail);
        if (!user) {
            throw new common_1.BadRequestException('Usuario no encontrado.');
        }
        let resetRecord = null;
        try {
            resetRecord = await this.prisma.passwordReset.findFirst({
                where: {
                    email: cleanEmail,
                    used: false,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
        }
        catch (_) { }
        if (resetRecord) {
            if (new Date() > new Date(resetRecord.expiresAt)) {
                try {
                    await this.prisma.passwordReset.update({
                        where: { id: resetRecord.id },
                        data: { used: true },
                    });
                }
                catch (_) { }
                throw new common_1.BadRequestException('El código ha expirado. Solicita un nuevo código.');
            }
            if (resetRecord.attempts >= 5 || resetRecord.code !== cleanCode) {
                throw new common_1.BadRequestException('Código incorrecto o no autorizado.');
            }
        }
        else {
            if (!user.resetPasswordCode || !user.resetPasswordExpires) {
                throw new common_1.BadRequestException('Código inválido o expirado.');
            }
            if (user.resetPasswordCode !== cleanCode) {
                throw new common_1.BadRequestException('Código incorrecto.');
            }
            if (new Date() > new Date(user.resetPasswordExpires)) {
                throw new common_1.BadRequestException('El código ha expirado. Solicita un nuevo código.');
            }
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
            if (resetRecord) {
                await this.prisma.passwordReset.update({
                    where: { id: resetRecord.id },
                    data: {
                        used: true,
                        usedAt: new Date(),
                    },
                });
            }
        }
        catch (e) {
            user.password = hashedPassword;
            user.resetPasswordCode = null;
            user.resetPasswordExpires = null;
        }
        return { message: 'Contraseña restablecida con éxito. Ya puedes iniciar sesión con tu nueva contraseña.' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_service_1.MailService,
        users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map