import { FastifyRequest } from 'fastify';
import { UserRole } from '@prisma/client'; 

interface DecodedUser {
    id: string; 
    email: string;
    role: UserRole;
    // Adicione 'sub: string' se estiver usando o campo sub no seu token
}

declare module 'fastify' {
    interface FastifyRequest {
        user: DecodedUser;
    }
}
