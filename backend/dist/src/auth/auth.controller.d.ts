import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(body: {
        name: string;
        email: string;
        password: string;
    }): Promise<{
        message: string;
        access_token: string;
        user: import("../users/users.service").UserResponse;
    }>;
    login(body: {
        email: string;
        password: string;
    }): Promise<{
        message: string;
        access_token: string;
        user: import("../users/users.service").UserResponse;
    }>;
    getProfile(req: any): Promise<import("../users/users.service").UserResponse>;
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
