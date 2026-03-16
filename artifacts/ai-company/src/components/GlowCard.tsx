import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColorClass?: string; 
  isActive?: boolean;
}

export function GlowCard({ children, className, glowColorClass = "border-border", isActive = false }: GlowCardProps) {
  return (
    <div className={cn(
      "relative group bg-card border rounded-xl overflow-hidden transition-all duration-500",
      isActive ? `border-${glowColorClass.replace('border-', '')}` : "border-white/5",
      isActive ? `shadow-[0_0_30px_-5px_var(--tw-shadow-color)] shadow-${glowColorClass.replace('border-', '')}/20` : "hover:border-white/20",
      className
    )}>
      {/* Background radial gradient */}
      <div className={cn(
        "absolute inset-0 opacity-0 transition-opacity duration-500",
        isActive ? "opacity-10" : "group-hover:opacity-5",
        `bg-gradient-to-br from-${glowColorClass.replace('border-', '')} via-transparent to-transparent`
      )} />
      
      <div className="relative z-10 p-5 h-full">
        {children}
      </div>
    </div>
  );
}
