import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
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
    me(user: any): any;
}
