import React from "react";

export default function PixelStar({ className = "", size = 'md', style }: { className?: string; size?: 'sm'|'md'|'lg'; style?: React.CSSProperties }) {
  const sizeMap = { sm: 8, md: 12, lg: 16 } as const;
  const s = sizeMap[size];
  return (
    <div className={className} style={{ width: s, height: s, ...style }}>
      <svg viewBox="0 0 4 4" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
        <rect x="1" y="0" width="2" height="1" fill="currentColor" />
        <rect x="0" y="1" width="4" height="2" fill="currentColor" />
        <rect x="1" y="3" width="2" height="1" fill="currentColor" />
      </svg>
    </div>
  );
}
