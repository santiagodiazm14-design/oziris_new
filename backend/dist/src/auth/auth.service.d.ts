import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private prisma;
    private mailService;
    private usersService;
    private jwtService;
    constructor(prisma: PrismaService, mailService: MailService, usersService: UsersService, jwtService: JwtService);
    register(data: {
        name: string;
        email: string;
        password: string;
    }): Promise<{
        message: string;
        access_token: string;
        user: import("../users/users.service").UserResponse;
    }>;
    login(data: {
        email: string;
        password: string;
    }): Promise<{
        message: string;
        access_token: string;
        user: import("../users/users.service").UserResponse;
    }>;
    getProfile(userId: string): Promise<import("../users/users.service").UserResponse>;
    private generateToken;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    verifyResetCode(email: string, code: string): Promise<{
        message: string;
    }>;
    resetPassword(email: string, code: string, newPassword: string): Promise<{
        message: string;
    }>;
}
