import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "../../ui/Card";
import { Brain, Zap, Target } from "lucide-react";

const FeatureTile: React.FC<{ title: string; desc: string; icon: React.ReactNode }> = ({ title, desc, icon }) => {
  return (
    <Card className="border-4 border-foreground pixel-card p-4 mb-4">
      <CardHeader className="flex items-start gap-3 p-0">
        <div className="w-12 h-12 flex items-center justify-center border-4 border-foreground bg-card mr-3 shadow-[3px_3px_0px_hsl(var(--foreground))]">
          <div className="w-6 h-6">{icon}</div>
        </div>
        <div>
          <CardTitle className="text-sm font-pixel">{title}</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">{desc}</CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
};

const Features: React.FC = () => {
  return (
    <section className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <FeatureTile
          title="SMART TRACKING"
          desc="Traffic light system: RED → YELLOW → GREEN. Level up each card!"
          icon={<Brain className="w-4 h-4" />}
        />
        <FeatureTile
          title="AI POWER-UP"
          desc="Upload documents and auto-generate flashcards with AI."
          icon={<Zap className="w-4 h-4" />}
        />
        <FeatureTile
          title="DECK BUILDER"
          desc="Create custom decks. Build your knowledge inventory!"
          icon={<Target className="w-4 h-4" />}
        />
      </div>
    </section>
  );
};

export default Features;
