

export default function PixelSpaceship({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="14" y="2" width="4" height="2" fill="currentColor" />
      <rect x="10" y="6" width="12" height="2" fill="currentColor" />
      <rect x="14" y="8" width="4" height="2" fill="hsl(var(--primary))" />
      <rect x="12" y="18" width="8" height="2" fill="currentColor" />
      <rect x="15" y="26" width="2" height="4" fill="hsl(var(--status-yellow))" className="animate-pulse" />
    </svg>
  );
}
