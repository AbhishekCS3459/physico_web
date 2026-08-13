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

  const coveragePincodes: { code: string; label: string }[] = [
    // Calgary
    { code: 'T1Y', label: 'Calgary NE' },
    { code: 'T2A', label: 'Calgary East' },
    { code: 'T2B', label: 'Calgary SE' },
    { code: 'T2C', label: 'Calgary SE' },
    { code: 'T2E', label: 'Calgary NE / Downtown North' },
    { code: 'T2G', label: 'Calgary Downtown / Inglewood' },
    { code: 'T2H', label: 'Calgary South' },
    { code: 'T2J', label: 'Calgary SE' },
    { code: 'T2K', label: 'Calgary North' },
    { code: 'T2L', label: 'Calgary NW' },
    { code: 'T2M', label: 'Calgary NW / Capitol Hill' },
    { code: 'T2N', label: 'Calgary NW / Kensington' },
    { code: 'T2P', label: 'Calgary Downtown' },
    { code: 'T2R', label: 'Calgary Beltline' },
    { code: 'T2S', label: 'Calgary SW / Mission' },
    { code: 'T2T', label: 'Calgary SW' },
    { code: 'T2V', label: 'Calgary SW' },
    { code: 'T2W', label: 'Calgary SW' },
    { code: 'T2X', label: 'Calgary South' },
    { code: 'T2Y', label: 'Calgary SW' },
    { code: 'T2Z', label: 'Calgary SE' },
    { code: 'T3A', label: 'Calgary NW' },
    { code: 'T3B', label: 'Calgary NW' },
    { code: 'T3C', label: 'Calgary SW' },
    { code: 'T3E', label: 'Calgary SW' },
    { code: 'T3G', label: 'Calgary NW' },
    { code: 'T3H', label: 'Calgary SW / West Springs' },
    { code: 'T3J', label: 'Calgary NE' },
    { code: 'T3K', label: 'Calgary North' },
    { code: 'T3L', label: 'Calgary NW' },
    { code: 'T3M', label: 'Calgary SE / Auburn Bay' },
    { code: 'T3N', label: 'Calgary NE / Airport' },
    { code: 'T3P', label: 'Calgary North' },
    { code: 'T3R', label: 'Calgary NW' },
    { code: 'T3S', label: 'Calgary SE' },
    // Surrounding communities
    { code: 'T1X', label: 'Chestermere' },
    { code: 'T4A', label: 'Airdrie East' },
    { code: 'T4B', label: 'Airdrie West' },
    { code: 'T4C', label: 'Cochrane' },
    { code: 'T0M', label: 'Crossfield / rural north' },
  ]

  for (const item of coveragePincodes) {
    await prisma.coveragePincode.upsert({
      where: { code: item.code },
      create: item,
      update: { label: item.label },
    })
  }

  console.log(`Coverage pincodes ready: ${coveragePincodes.length} FSAs`)

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
