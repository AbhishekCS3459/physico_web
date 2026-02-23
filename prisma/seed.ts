import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Check if admin already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: 'admin@physiorehab.com' },
  })

  if (existingAdmin) {
    console.log('Admin user already exists, skipping seed...')
    return
  }

  // Hash password
  const hashedPassword = await bcrypt.hash('admin', 10)

  // Create super_admin user (first user is super_admin)
  const admin = await prisma.admin.create({
    data: {
      email: 'admin@physiorehab.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'super_admin',
    },
  })

  console.log('Admin user created:', {
    id: admin.id,
    email: admin.email,
  })

  console.log('Database seeded successfully!')
  console.log('Login credentials:')
  console.log('Email: admin@physiorehab.com')
  console.log('Password: admin')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
