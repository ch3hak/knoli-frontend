import React from "react";

interface PixelUfoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const PixelUfo: React.FC<PixelUfoProps> = ({ className = "", size = "md" }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  return (
    <svg
      viewBox="0 0 32 32"
      className={`${sizeClasses[size]} ${className}`}
      fill="currentColor"
    >
      <rect x="12" y="4" width="2" height="2" fill="currentColor" />
      <rect x="14" y="4" width="4" height="2" fill="currentColor" />
      <rect x="18" y="4" width="2" height="2" fill="currentColor" />
      <rect x="10" y="6" width="2" height="2" fill="currentColor" />
      <rect x="12" y="6" width="8" height="2" fill="hsl(var(--status-green))" />
      <rect x="20" y="6" width="2" height="2" fill="currentColor" />
      <rect x="10" y="8" width="2" height="2" fill="currentColor" />
      <rect x="12" y="8" width="8" height="2" fill="hsl(var(--status-green))" />
      <rect x="20" y="8" width="2" height="2" fill="currentColor" />
      <rect x="10" y="10" width="12" height="2" fill="currentColor" />
      
      <rect x="6" y="12" width="2" height="2" fill="currentColor" />
      <rect x="8" y="12" width="16" height="2" fill="hsl(var(--muted))" />
      <rect x="24" y="12" width="2" height="2" fill="currentColor" />
      <rect x="4" y="14" width="2" height="2" fill="currentColor" />
      <rect x="6" y="14" width="20" height="2" fill="hsl(var(--muted))" />
      <rect x="26" y="14" width="2" height="2" fill="currentColor" />
      <rect x="2" y="16" width="2" height="2" fill="currentColor" />
      <rect x="4" y="16" width="24" height="2" fill="hsl(var(--muted))" />
      <rect x="28" y="16" width="2" height="2" fill="currentColor" />
      
      <rect x="6" y="16" width="2" height="2" fill="hsl(var(--status-red))" />
      <rect x="12" y="16" width="2" height="2" fill="hsl(var(--status-yellow))" />
      <rect x="18" y="16" width="2" height="2" fill="hsl(var(--status-green))" />
      <rect x="24" y="16" width="2" height="2" fill="hsl(var(--status-red))" />
      
      <rect x="4" y="18" width="2" height="2" fill="currentColor" />
      <rect x="6" y="18" width="20" height="2" fill="hsl(var(--muted))" />
      <rect x="26" y="18" width="2" height="2" fill="currentColor" />
      <rect x="6" y="20" width="2" height="2" fill="currentColor" />
      <rect x="8" y="20" width="16" height="2" fill="currentColor" />
      <rect x="24" y="20" width="2" height="2" fill="currentColor" />
      
      <rect x="12" y="22" width="2" height="2" fill="hsl(var(--status-yellow))" opacity="0.6" />
      <rect x="18" y="22" width="2" height="2" fill="hsl(var(--status-yellow))" opacity="0.6" />
      <rect x="10" y="24" width="2" height="2" fill="hsl(var(--status-yellow))" opacity="0.4" />
      <rect x="14" y="24" width="4" height="2" fill="hsl(var(--status-yellow))" opacity="0.5" />
      <rect x="20" y="24" width="2" height="2" fill="hsl(var(--status-yellow))" opacity="0.4" />
      <rect x="8" y="26" width="2" height="2" fill="hsl(var(--status-yellow))" opacity="0.2" />
      <rect x="12" y="26" width="8" height="2" fill="hsl(var(--status-yellow))" opacity="0.3" />
      <rect x="22" y="26" width="2" height="2" fill="hsl(var(--status-yellow))" opacity="0.2" />
    </svg>
  );
};

export default PixelUfo;
