import * as React from "react"
import { cn } from "@/lib/utils"

const Button = React.forwardRef(({ className, variant = "default", size = "default", asChild, ...props }, ref) => {
  const variants = {
    default: "bg-slate-900 text-white hover:bg-slate-800 shadow-sm active:translate-y-px",
    teal: "bg-teal-600 text-white hover:bg-teal-700 shadow-sm shadow-teal-600/20 active:translate-y-px",
    outline: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-2xs hover:border-slate-300",
    ghost: "hover:bg-slate-100 hover:text-slate-900 text-slate-600",
    link: "text-teal-700 underline-offset-4 hover:underline",
    danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-600/20 active:translate-y-px",
  }

  const sizes = {
    default: "h-10 px-4 py-2 rounded-lg text-sm font-semibold",
    sm: "h-8.5 rounded-lg px-3 text-xs font-semibold",
    lg: "h-12 rounded-xl px-7 text-base font-semibold",
    icon: "h-10 w-10 rounded-lg",
  }

  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
