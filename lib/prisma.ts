import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Initialize Prisma Client
let prisma: PrismaClient

try {
  if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient()
  } else {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : [],
      })
    }
    prisma = globalForPrisma.prisma
  }
} catch (error: any) {
  // If Prisma Client generation failed, log helpful error
  if (error.message?.includes('Cannot find module') || error.message?.includes('@prisma/client')) {
    console.error('\n❌ Prisma Client not generated!')
    console.error('📋 Please run: cd physico_web && pnpm db:generate\n')
  }
  throw error
}

export { prisma }
