"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, Mail, Sparkles } from "lucide-react"
import { motion } from "motion/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import toast from "react-hot-toast"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error("Please enter your email address")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/user/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setIsSubmitted(true)
        toast.success("If an account with that email exists, a password reset link has been sent.")
      } else {
        toast.error(data.error || "Failed to send password reset email")
      }
    } catch (error) {
      console.error("Forgot password error:", error)
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
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
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Forgot Password
              </h1>
              <p className="text-muted-foreground text-sm md:text-base">
                {isSubmitted
                  ? "Check your email for reset instructions"
                  : "Enter your email to reset your password"}
              </p>
            </motion.div>

            {!isSubmitted ? (
              <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 transition-colors group-focus-within:text-primary" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-12 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-background/50 backdrop-blur-sm"
                      disabled={isLoading}
                      required
                    />
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
                      Sending...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Send Reset Link
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
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-6 text-center"
              >
                <div className="p-6 bg-primary/10 rounded-xl border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-4">
                    If an account with that email exists, we've sent you a password reset link.
                    Please check your email and click the link to reset your password.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    The link will expire in 1 hour for security reasons.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <Link href="/user-login">
                    <Button
                      variant="outline"
                      className="w-full h-12 text-base font-semibold"
                    >
                      <ArrowLeft className="mr-2 h-5 w-5" />
                      Back to Login
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsSubmitted(false)
                      setEmail("")
                    }}
                    className="w-full h-12 text-base"
                  >
                    Send Another Email
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

