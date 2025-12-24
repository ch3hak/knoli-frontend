import React from "react";
import PixelSpaceship from "../../pixel/PixelSpaceship";
import PixelCoin from "../../pixel/PixelCoin";
import { Button } from "../../ui/Button";

const Hero: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  return (
    <section className="w-full text-center mb-8">
      <div className="mx-auto w-20 h-20 md:w-28 md:h-28 rounded-2xl mb-4 border-4 border-foreground bg-card flex items-center justify-center shadow-[6px_6px_0px_hsl(var(--foreground))]">
        <PixelSpaceship className="w-12 h-12 md:w-20 md:h-20 text-foreground" />
      </div>

      <h1 className="font-pixel text-3xl md:text-5xl tracking-wide mb-1">KNOLI</h1>
      <p className="font-retro text-xs md:text-sm text-muted-foreground mb-4 uppercase tracking-widest">[ FLASHCARD QUEST ]</p>

      <div className="flex items-center justify-center gap-3 mb-6">
        <PixelCoin className="w-6 h-6" />
        <p className="font-retro text-base md:text-xl text-muted-foreground">Master knowledge. Level up your brain!</p>
        <PixelCoin className="w-6 h-6" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button size="lg" onClick={onStart} className="w-full h-12 font-pixel">
          <span className="mr-2">▶</span> NEW GAME
        </Button>

        <Button size="lg" variant="outline" onClick={onStart} className="w-full h-12 font-pixel">
          <span className="mr-2">↻</span> CONTINUE
        </Button>
      </div>

      <div className="mt-4 font-pixel text-xs text-muted-foreground">
        INSERT COIN TO START<span className="blink">_</span>
      </div>
    </section>
  );
};

export default Hero;
