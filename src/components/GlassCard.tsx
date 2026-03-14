import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

const GlassCard = ({ children, className, hover = true }: GlassCardProps) => (
  <div
    className={cn(
      "glass-card rounded-xl overflow-hidden",
      hover && "glass-hover",
      className
    )}
  >
    {children}
  </div>
);

export default GlassCard;
