import { ButtonHTMLAttributes } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CyberButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export function CyberButton({ 
  children, 
  variant = 'primary', 
  className, 
  isLoading,
  disabled,
  ...props 
}: CyberButtonProps) {
  
  const baseClasses = "relative overflow-hidden font-display tracking-widest uppercase font-bold py-3 px-8 rounded-none border transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary/10 border-primary text-primary hover:bg-primary/20 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]",
    secondary: "bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:text-white hover:border-white/40",
    danger: "bg-red-500/10 border-red-500 text-red-500 hover:bg-red-500/20 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={cn(baseClasses, variants[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Scanning laser line effect */}
      {!disabled && !isLoading && (
        <span className="absolute top-0 left-[-100%] w-full h-[2px] bg-gradient-to-r from-transparent via-current to-transparent group-hover:animate-[scan_1.5s_ease-in-out_infinite]" />
      )}
      
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading ? (
          <span className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
        ) : children}
      </span>
      
      {/* Diagonal corner cuts using SVG backgrounds or clip-path could go here for extra cyber feel, keeping it clean with borders for now */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-current opacity-50" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-current opacity-50" />
    </motion.button>
  );
}
