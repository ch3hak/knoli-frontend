import React from "react";
import { Button } from "../../ui/Button";

interface CTAProps {
  onAuth: () => void;
}

const CTA: React.FC<CTAProps> = ({ onAuth }) => {
  return (
    <section className="py-8 text-center">
      <div className="inline-flex items-center gap-3 border-4 border-foreground bg-card px-6 py-3 shadow-[4px_4px_0px_hsl(var(--foreground))]">
        <div className="font-pixel text-xs">Ready to level up?</div>
        <Button size="sm" onClick={onAuth}>Get Started</Button>
      </div>
    </section>
  );
};

export default CTA;
