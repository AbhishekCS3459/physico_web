import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function setupDatabase() {
  console.log('🚀 Setting up database...\n')

  try {
    // Check if Admin table exists by trying to query it
    try {
      await prisma.$queryRaw`SELECT 1 FROM "Admin" LIMIT 1`
      console.log('✅ Admin table already exists')
    } catch (error: any) {
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        console.log('⚠️  Admin table does not exist. Please run: pnpm db:push')
        console.log('   This will create the Admin table in your database.\n')
        return
      }
      throw error
    }

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: 'admin@physiorehab.com' },
    })

    if (existingAdmin) {
      console.log('✅ Admin user already exists')
      console.log('   Email: admin@physiorehab.com')
      console.log('   Password: admin\n')
      return
    }

    // Hash password
    console.log('🔐 Hashing password...')
    const hashedPassword = await bcrypt.hash('admin', 10)

    // Create admin user
    console.log('👤 Creating admin user...')
    const admin = await prisma.admin.create({
      data: {
        email: 'admin@physiorehab.com',
        password: hashedPassword,
        name: 'Admin User',
      },
    })

    console.log('\n✅ Admin user created successfully!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📧 Email: admin@physiorehab.com')
    console.log('🔑 Password: admin')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  } catch (error) {
    console.error('❌ Error setting up database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

setupDatabase()
  .then(() => {
    console.log('✨ Setup complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error)
    process.exit(1)
  })
