import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function setupDatabase() {
  console.log('🚀 Setting up database...\n')

  try {
    try {
      await prisma.admin.findFirst({ take: 1 })
      console.log('✅ Database is reachable')
    } catch (error) {
      console.log('⚠️  Could not reach the database. Check DATABASE_URL and run: pnpm db:migrate')
      throw error
    }

    const existingAdmin = await prisma.admin.findUnique({
      where: { email: 'admin@physiorehab.com' },
    })

    if (existingAdmin) {
      console.log('✅ Admin user already exists')
      console.log('   Email: admin@physiorehab.com')
      console.log('   Password: admin\n')
      return
    }

    console.log('🔐 Hashing password...')
    const hashedPassword = await bcrypt.hash('admin', 10)

    console.log('👤 Creating admin user...')
    await prisma.admin.create({
      data: {
        email: 'admin@physiorehab.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'super_admin',
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
