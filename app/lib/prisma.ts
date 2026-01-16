import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    // Prisma v7 бере DATABASE_URL з process.env автоматично
});

export default prisma;
