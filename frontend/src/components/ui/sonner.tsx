"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--accent": "#CCFF00", /* Lime yellow for highlight */
          "--accent-foreground": "#000000", /* Black text on lime yellow */
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
