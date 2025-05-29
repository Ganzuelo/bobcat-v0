"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface CustomAvatarProps {
  src?: string | null
  alt: string
  initials: string
  backgroundColor: string
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
}

export function CustomAvatar({ src, alt, initials, backgroundColor, size = "md", className }: CustomAvatarProps) {
  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {src && <AvatarImage src={src || "/placeholder.svg"} alt={alt} />}
      <AvatarFallback style={{ backgroundColor }} className="text-white font-medium">
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
