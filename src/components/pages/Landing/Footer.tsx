import React from "react";
import PixelSpaceship from "../../pixel/PixelSpaceship";

const Footer: React.FC = () => {
  return (
    <footer className="mt-8 text-center">
      <div className="inline-flex items-center gap-3 border-4 border-foreground bg-card px-4 py-2 shadow-[4px_4px_0px_hsl(var(--foreground))]">
        <PixelSpaceship className="w-5 h-5 text-foreground" />
        <span className="font-pixel text-xs">© 2025 KNOLI SYSTEMS</span>
        <PixelSpaceship className="w-5 h-5 text-foreground transform scale-x-[-1]" />
      </div>

      <p className="mt-3 font-retro text-xs text-muted-foreground">CREDITS: ∞  |  BUILT WITH ❤️</p>
    </footer>
  );
};

export default Footer;
