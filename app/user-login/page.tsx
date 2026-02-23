"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

/**
 * Legacy URL: redirect to unified login. One login page for both admin and patient.
 */
export default function UserLoginPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/login")
  }, [router])
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Redirecting to sign in...</p>
    </div>
  )
}
