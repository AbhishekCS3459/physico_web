import { cn } from "@/lib/utils"
import Image from "next/image"

type BrandLogoProps = {
  className?: string
  priority?: boolean
  sizes?: string
}

export function BrandLogo({
  className,
  priority = false,
  sizes = "(max-width: 640px) 148px, (max-width: 1024px) 178px, 208px",
}: BrandLogoProps) {
  return (
    <div className={cn("relative shrink-0", className)}>
      <Image
        src="/MainLogo.png"
        alt="Physio Rehab at Home"
        fill
        className="object-contain object-left dark:hidden"
        sizes={sizes}
        priority={priority}
      />
      <Image
        src="/MainLogo-dark.png"
        alt=""
        fill
        className="object-contain object-left hidden dark:block"
        sizes={sizes}
        priority={priority}
      />
    </div>
  )
}
