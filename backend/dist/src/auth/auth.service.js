"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const mail_service_1 = require("../mail/mail.service");
let AuthService = class AuthService {
    prisma;
    mailService;
    constructor(prisma, mailService) {
        this.prisma = prisma;
        this.mailService = mailService;
    }
    async forgotPassword(email) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return { message: 'Si el correo existe, se ha enviado un código de recuperación.' };
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date();
        expires.setMinutes(expires.getMinutes() + 15);
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
    async verifyResetCode(email, code) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user || !user.resetPasswordCode || !user.resetPasswordExpires) {
            throw new common_1.BadRequestException('Código inválido o expirado.');
        }
        if (user.resetPasswordCode !== code) {
            throw new common_1.BadRequestException('Código incorrecto.');
        }
        if (new Date() > user.resetPasswordExpires) {
            throw new common_1.BadRequestException('El código ha expirado.');
        }
        return { message: 'Código verificado con éxito.' };
    }
    async resetPassword(email, code, newPassword) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user || !user.resetPasswordCode || !user.resetPasswordExpires) {
            throw new common_1.BadRequestException('Código inválido o expirado.');
        }
        if (user.resetPasswordCode !== code) {
            throw new common_1.BadRequestException('Código incorrecto.');
        }
        if (new Date() > user.resetPasswordExpires) {
            throw new common_1.BadRequestException('El código ha expirado.');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                password: newPassword,
                resetPasswordCode: null,
                resetPasswordExpires: null,
            },
        });
        return { message: 'Contraseña restablecida con éxito.' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_service_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map