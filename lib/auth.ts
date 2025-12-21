import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { prisma } from './prisma'

export interface AdminSession {
  id: string
  email: string
  name?: string
  role: 'admin'
}

export interface UserSession {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: 'user'
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createSession(adminId: string, email: string, name?: string): Promise<void> {
  const cookieStore = await cookies()
  const sessionData: AdminSession = {
    id: adminId,
    email,
    name,
    role: 'admin',
  }
  
  // Set session cookie (expires in 7 days)
  cookieStore.set('admin_session', JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function getSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('admin_session')
    
    if (!sessionCookie?.value) {
      return null
    }

    const session = JSON.parse(sessionCookie.value) as AdminSession
    
    // Verify admin still exists
    const admin = await prisma.admin.findUnique({
      where: { id: session.id },
    })

    if (!admin) {
      return null
    }

    return session
  } catch {
    return null
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
}

export async function requireAuth(): Promise<AdminSession> {
  const session = await getSession()
  
  if (!session) {
    throw new Error('Unauthorized')
  }

  return session
}

// User session functions
export async function createUserSession(userId: string, email: string, firstName?: string, lastName?: string): Promise<void> {
  const cookieStore = await cookies()
  const sessionData: UserSession = {
    id: userId,
    email,
    firstName,
    lastName,
    role: 'user',
  }
  
  // Set session cookie (expires in 7 days)
  cookieStore.set('user_session', JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function getUserSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('user_session')
    
    if (!sessionCookie?.value) {
      return null
    }

    const session = JSON.parse(sessionCookie.value) as UserSession
    
    // Verify user still exists
    const user = await (prisma as any).user.findUnique({
      where: { id: session.id },
    })

    if (!user) {
      return null
    }

    return session
  } catch {
    return null
  }
}

export async function deleteUserSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('user_session')
}

export async function requireUserAuth(): Promise<UserSession> {
  const session = await getUserSession()
  
  if (!session) {
    throw new Error('Unauthorized')
  }

  return session
}
