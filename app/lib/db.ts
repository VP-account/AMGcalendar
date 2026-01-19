import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Для Prisma 7.2.0 використовуйте process.env.DATABASE_URL безпосередньо
const prismaClientOptions = process.env.DATABASE_URL 
  ? { datasources: { db: { url: process.env.DATABASE_URL } } }
  : {}

export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaClientOptions)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
