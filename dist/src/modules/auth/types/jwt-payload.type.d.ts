import { UserRole } from '@prisma/client';
export type JwtPayloadType = {
    sub: number;
    email: string;
    role: UserRole;
};
