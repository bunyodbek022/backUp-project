import { JwtService } from '@nestjs/jwt';
import PrismaService from 'src/Prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
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
    validateUser(userId: number): Promise<{
        id: number;
        email: string;
        fullName: string;
        role: import("@prisma/client").$Enums.UserRole;
        isActive: boolean;
    }>;
}
