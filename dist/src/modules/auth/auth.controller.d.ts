import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
        message: string;
        accessToken: string;
        user: {
            id: number;
            fullName: string;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
    }>;
    register(dto: RegisterDto): Promise<{
        message: string;
        accessToken: string;
        user: {
            id: number;
            fullName: string;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
            trialEndsAt: Date | null;
        };
    }>;
    me(user: any): any;
}
