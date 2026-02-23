import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { prisma } from './prisma'

export type AdminRole = 'staff' | 'super_admin'

export interface AdminSession {
  id: string
  email: string
  name?: string
  role: AdminRole
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

export async function createSession(adminId: string, email: string, name?: string, role?: AdminRole): Promise<void> {
  const cookieStore = await cookies()
  const sessionData: AdminSession = {
    id: adminId,
    email,
    name,
    role: role ?? 'staff',
  }
  
  // Set session cookie (expires in 7 days)
  cookieStore.set('admin_session', JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
    // Ensure cookie persists across browser sessions
  })
}

export async function getSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('admin_session')
    
    if (!sessionCookie?.value) {
      return null
    }

    const parsed = JSON.parse(sessionCookie.value) as { id: string; email: string; name?: string; role?: AdminRole }
    
    // Verify admin still exists and get current role from DB
    const admin = await prisma.admin.findUnique({
      where: { id: parsed.id },
      select: { id: true, email: true, name: true, role: true },
    })

    if (!admin) {
      return null
    }

    const role = (admin.role === 'super_admin' ? 'super_admin' : 'staff') as AdminRole
    return {
      id: admin.id,
      email: admin.email,
      name: admin.name ?? undefined,
      role,
    }
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

/** Use for routes that only super_admin may access (e.g. dashboard, edit/delete bookings). */
export async function requireSuperAdmin(): Promise<AdminSession> {
  const session = await requireAuth()
  if (session.role !== 'super_admin') {
    throw new Error('Forbidden')
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
