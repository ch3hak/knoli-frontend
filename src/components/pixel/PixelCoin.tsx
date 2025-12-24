import React from "react";

export default function PixelCoin({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 16 16" className={className} style={{ imageRendering: 'pixelated', ...style }}>
      <rect x="4" y="0" width="8" height="2" fill="hsl(var(--status-yellow))" />
      <rect x="2" y="2" width="12" height="10" fill="hsl(45 93% 60%)" />
      <rect x="5" y="4" width="2" height="8" fill="hsl(var(--foreground))" />
      <rect x="9" y="4" width="2" height="2" fill="hsl(var(--foreground))" />
      <rect x="7" y="6" width="2" height="2" fill="hsl(var(--foreground))" />
      <rect x="4" y="4" width="2" height="2" fill="hsl(45 93% 80%)" />
    </svg>
  );
}
