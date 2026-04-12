import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const ADMIN_EMAIL = 'admin@physiorehab.com'
const ADMIN_PASSWORD = 'admin'

async function main() {
  console.log('Seeding database...')

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10)

  const admin = await prisma.admin.upsert({
    where: { email: ADMIN_EMAIL },
    create: {
      email: ADMIN_EMAIL,
      password: hashedPassword,
      name: 'Admin User',
      role: 'super_admin',
    },
    update: {
      password: hashedPassword,
      role: 'super_admin',
    },
  })

  console.log('Admin user ready:', {
    id: admin.id,
    email: admin.email,
    role: admin.role,
  })

  console.log('Database seeded successfully!')
  console.log('Login credentials:')
  console.log(`Email: ${ADMIN_EMAIL}`)
  console.log(`Password: ${ADMIN_PASSWORD}`)
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
