import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, VerifyResetCodeDto, ResetPasswordDto } from './dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(body: RegisterDto): Promise<{
        message: string;
        access_token: string;
        user: import("../users/dto").UserResponse;
    }>;
    login(body: LoginDto): Promise<{
        message: string;
        access_token: string;
        user: import("../users/dto").UserResponse;
    }>;
    getProfile(req: any): Promise<import("../users/dto").UserResponse>;
    forgotPassword(body: ForgotPasswordDto, req: any): Promise<{
        message: string;
        email?: undefined;
    } | {
        message: string;
        email: string;
    }>;
    verifyResetCode(body: VerifyResetCodeDto): Promise<{
        message: string;
    }>;
    resetPassword(body: ResetPasswordDto): Promise<{
        message: string;
    }>;
}
