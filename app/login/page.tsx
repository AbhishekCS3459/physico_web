"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import { Eye, EyeOff, Loader2, Lock, Mail, Sparkles } from "lucide-react"
import { motion } from "motion/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    // If already logged in (admin or patient), redirect to the right place
    const checkAuth = async () => {
      try {
        const [adminRes, userRes] = await Promise.all([
          fetch("/api/auth/me", { credentials: 'include' }),
          fetch("/api/auth/user/me", { credentials: 'include' }),
        ])
        const adminData = await adminRes.json()
        const userData = await userRes.json()
        if (adminData.authenticated) {
          router.replace(adminData.admin?.role === "staff" ? "/admin/charts" : "/admin")
          return
        }
        if (userData.authenticated) {
          router.replace("/my-bookings")
          return
        }
      } catch (error) {
        console.error("Auth check error:", error)
      }
    }
    checkAuth()

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error("Please fill in all fields")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Login successful!")
        if (data.role === "admin") {
          router.push(data.admin?.role === "staff" ? "/admin/charts" : "/admin")
        } else {
          router.push("/my-bookings")
        }
        router.refresh()
      } else {
        toast.error(data.error || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Theme toggle for login page (no header) */}
      <div className="fixed top-4 right-4 z-[100] rounded-full p-0.5">
        <ThemeToggle />
      </div>
      {/* Animated Background with Blur Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        
        {/* Mouse-following gradient */}
        <motion.div
          className="absolute w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
          transition={{
            type: "spring",
            stiffness: 50,
            damping: 20,
          }}
        />

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Login Modal/Popup */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Blurred backdrop for the modal */}
          <div className="absolute inset-0 -z-10 backdrop-blur-xl bg-background/40 rounded-3xl border border-border/50 shadow-2xl" />
          
          {/* Main modal content */}
          <div className="relative bg-background/80 backdrop-blur-md rounded-3xl border border-border/50 shadow-2xl p-8 md:p-10">
            {/* Decorative gradient border */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/20 via-transparent to-accent/20 opacity-50 -z-10 blur-xl" />
            
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Sign in
              </h1>
              <p className="text-muted-foreground text-sm md:text-base">
                Use your email and password. We’ll take you to the right place.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 text-xs"
                onClick={() => {
                  setEmail("admin@physiorehab.com")
                  setPassword("admin")
                  toast.success("Admin credentials filled")
                }}
              >
                Fill admin demo (admin@physiorehab.com / admin)
              </Button>
            </motion.div>

            {/* Login Form */}
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 transition-colors group-focus-within:text-primary" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-12 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-background/50 backdrop-blur-sm"
                    disabled={isLoading}
                    required
                  />
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <Link
                    href="/admin/forgot-password"
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 transition-colors group-focus-within:text-primary z-10" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-12 h-12 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-background/50 backdrop-blur-sm"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.form>

            <p className="text-center text-sm text-muted-foreground mt-6 space-x-4">
              <Link href="/register" className="text-primary hover:underline font-medium">
                Register as patient
              </Link>
              <span>·</span>
              <Link href="/register-staff" className="text-primary hover:underline font-medium">
                Staff sign up
              </Link>
            </p>

            {/* Admin demo credentials hint */}
            <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border/50">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Admin login (for reference)
              </p>
              <p className="text-sm text-foreground font-mono">
                Email: <span className="text-primary font-medium">admin@physiorehab.com</span>
              </p>
              <p className="text-sm text-foreground font-mono mt-1">
                Password: <span className="text-primary font-medium">admin</span>
              </p>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -z-10" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl -z-10" />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
