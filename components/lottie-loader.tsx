"use client"

import { cn } from "@/lib/utils"
import Lottie, { type LottieRefCurrentProps } from "lottie-react"
import { useEffect, useRef, useState } from "react"

const LOADER_PATH = "/assets/loader/travel%20loading.json"

let cachedAnimation: object | null = null
let loadPromise: Promise<object> | null = null

function loadTravelAnimation(): Promise<object> {
  if (cachedAnimation) return Promise.resolve(cachedAnimation)
  if (!loadPromise) {
    loadPromise = fetch(LOADER_PATH)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load Lottie animation")
        return res.json()
      })
      .then((data) => {
        cachedAnimation = data
        return data
      })
  }
  return loadPromise
}

const sizeMap = {
  xs: 20,
  sm: 32,
  md: 64,
  lg: 120,
  xl: 160,
} as const

export type LottieLoaderSize = keyof typeof sizeMap

type LottieLoaderProps = {
  size?: LottieLoaderSize | number
  className?: string
  loop?: boolean
}

export function LottieLoader({ size = "md", className, loop = true }: LottieLoaderProps) {
  const [animationData, setAnimationData] = useState<object | null>(cachedAnimation)
  const lottieRef = useRef<LottieRefCurrentProps>(null)
  const dimension = typeof size === "number" ? size : sizeMap[size]

  useEffect(() => {
    if (animationData) return
    let cancelled = false
    loadTravelAnimation()
      .then((data) => {
        if (!cancelled) setAnimationData(data)
      })
      .catch(() => {
        if (!cancelled) setAnimationData(null)
      })
    return () => {
      cancelled = true
    }
  }, [animationData])

  if (!animationData) {
    return (
      <div
        className={cn("rounded-full bg-primary/10 animate-pulse", className)}
        style={{ width: dimension, height: dimension }}
        aria-hidden
      />
    )
  }

  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={animationData}
      loop={loop}
      className={cn("pointer-events-none", className)}
      style={{ width: dimension, height: dimension }}
      aria-hidden
    />
  )
}

type LoadingScreenProps = {
  message?: string
  className?: string
  size?: LottieLoaderSize | number
  fullScreen?: boolean
}

/** Centered loader for pages, cards, and auth gates */
export function LoadingScreen({
  message = "Loading…",
  className,
  size = "lg",
  fullScreen = false,
}: LoadingScreenProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-center",
        fullScreen && "min-h-screen w-full",
        className
      )}
    >
      <LottieLoader size={size} />
      {message ? (
        <p className="text-sm sm:text-base text-muted-foreground">{message}</p>
      ) : null}
    </div>
  )
}

/** Inline loader for buttons and compact UI */
export function LoadingInline({
  className,
  size = "xs",
}: {
  className?: string
  size?: LottieLoaderSize | number
}) {
  return <LottieLoader size={size} className={cn("inline-block shrink-0", className)} />
}
