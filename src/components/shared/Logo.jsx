import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Logo({
  showText = true,
  className,
  imageClassName,
  textClassName,
  iconOnly = false,
  href = "/",
  variant = "dark"
}) {
  const content = (
    <div className={cn("inline-flex items-center gap-3 group select-none py-1", className)}>
      {/* 3D Cyan-Blue Glow Cross Emblem */}
      <div className="relative flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105">
        <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-400/30 to-blue-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <Image
          src="/logo-icon.png"
          alt="MediAI Emblem"
          width={40}
          height={40}
          className={cn("h-9.5 w-auto object-contain drop-shadow-[0_4px_10px_rgba(6,182,212,0.25)] relative z-10", imageClassName)}
          priority
        />
      </div>

      {/* Crisp Horizontal Brand Text */}
      {!iconOnly && showText && (
        <span
          className={cn(
            "text-2xl font-black tracking-tight flex items-baseline font-sans",
            textClassName
          )}
        >
          <span
            className={cn(
              "transition-colors duration-200",
              variant === "light" ? "text-white" : "text-slate-900"
            )}
          >
            Medi
          </span>
          <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-600 bg-clip-text text-transparent font-black ml-0.5 drop-shadow-[0_1px_2px_rgba(6,182,212,0.25)]">
            AI
          </span>
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-xl transition-all">
        {content}
      </Link>
    );
  }

  return content;
}
