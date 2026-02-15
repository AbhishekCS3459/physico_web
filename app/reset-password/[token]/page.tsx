"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Eye, EyeOff, Loader2, Lock, Sparkles } from "lucide-react"
import { motion } from "motion/react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function ResetPasswordPage() {
  const router = useRouter()
  const params = useParams()
  const token = params?.token as string
  
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      toast.error("Invalid reset link")
      router.push("/forgot-password")
    }
  }, [token, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields")
      return
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (!token) {
      toast.error("Invalid reset token")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/user/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (data.success) {
        setIsSuccess(true)
        toast.success("Password reset successful! Redirecting to login...")
        setTimeout(() => {
          router.push("/user-login")
        }, 3000)
      } else {
        toast.error(data.error || "Failed to reset password")
        if (data.error?.includes("expired") || data.error?.includes("Invalid")) {
          setTimeout(() => {
            router.push("/forgot-password")
          }, 2000)
        }
      }
    } catch (error) {
      console.error("Reset password error:", error)
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <div className="relative bg-background/80 backdrop-blur-md rounded-3xl border border-border/50 shadow-2xl p-8 md:p-10 text-center">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/20 via-transparent to-accent/20 opacity-50 -z-10 blur-xl" />
              
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500/10 mb-4">
                  <Sparkles className="w-8 h-8 text-green-500" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Password Reset Successful!
                </h1>
                <p className="text-muted-foreground text-sm md:text-base">
                  Your password has been reset successfully. You will be redirected to the login page shortly.
                </p>
              </motion.div>

              <Link href="/user-login">
                <Button className="w-full h-12 text-base font-semibold">
                  Go to Login
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="relative bg-background/80 backdrop-blur-md rounded-3xl border border-border/50 shadow-2xl p-8 md:p-10">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/20 via-transparent to-accent/20 opacity-50 -z-10 blur-xl" />
            
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Reset Password
              </h1>
              <p className="text-muted-foreground text-sm md:text-base">
                Enter your new password below
              </p>
            </motion.div>

            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  New Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 transition-colors group-focus-within:text-primary z-10" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-12 h-12 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-background/50 backdrop-blur-sm"
                    disabled={isLoading}
                    required
                    minLength={6}
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm New Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 transition-colors group-focus-within:text-primary z-10" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-12 pr-12 h-12 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-background/50 backdrop-blur-sm"
                    disabled={isLoading}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Reset Password
                  </>
                )}
              </Button>

              <div className="text-center">
                <Link
                  href="/user-login"
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Link>
              </div>
            </motion.form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

