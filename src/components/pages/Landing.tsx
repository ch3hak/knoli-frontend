import { useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import { Brain, Zap, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card";
import PixelCoin from "../pixel/PixelCoin";
import PixelStar from "../pixel/PixelStar";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative scanlines overflow-hidden">

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <PixelStar className="absolute top-[10%] left-[5%] text-foreground/30 animate-pulse" size="sm" />
        <PixelStar className="absolute top-[15%] right-[10%] text-primary/50 animate-pulse" size="md" style={{ animationDelay: "0.5s" }} />
        <PixelStar className="absolute top-[25%] left-[15%] text-foreground/20 animate-pulse" size="lg" style={{ animationDelay: "1s" }} />
        <PixelStar className="absolute top-[30%] right-[20%] text-status-yellow/40 animate-pulse" size="sm" style={{ animationDelay: "0.3s" }} />
        <PixelStar className="absolute top-[45%] left-[8%] text-foreground/25 animate-pulse" size="md" style={{ animationDelay: "0.7s" }} />
        <PixelStar className="absolute top-[50%] right-[5%] text-primary/40 animate-pulse" size="sm" style={{ animationDelay: "1.2s" }} />
        <PixelStar className="absolute top-[65%] left-[25%] text-foreground/30 animate-pulse" size="lg" style={{ animationDelay: "0.2s" }} />
        <PixelStar className="absolute top-[70%] right-[15%] text-status-green/30 animate-pulse" size="md" style={{ animationDelay: "0.9s" }} />
        <PixelStar className="absolute top-[85%] left-[10%] text-foreground/20 animate-pulse" size="sm" style={{ animationDelay: "1.5s" }} />
        <PixelStar className="absolute top-[80%] right-[25%] text-primary/30 animate-pulse" size="lg" style={{ animationDelay: "0.4s" }} />
      </div>


      <div className="fixed inset-0 pointer-events-none overflow-hidden hidden sm:block">
        <PixelCoin className="absolute top-[20%] right-[8%] w-8 h-8 animate-bounce" style={{ animationDelay: "0s", animationDuration: "2s" }} />
        <PixelCoin className="absolute top-[40%] left-[5%] w-6 h-6 animate-bounce" style={{ animationDelay: "0.5s", animationDuration: "2.5s" }} />
        <PixelCoin className="absolute top-[60%] right-[12%] w-7 h-7 animate-bounce" style={{ animationDelay: "1s", animationDuration: "2.2s" }} />
        <PixelCoin className="absolute bottom-[25%] left-[8%] w-8 h-8 animate-bounce" style={{ animationDelay: "0.3s", animationDuration: "2.8s" }} />
      </div>

      <div className="fixed top-4 left-4 w-8 h-8 border-4 border-foreground bg-status-red shadow-[2px_2px_0px_#1a1a1a]" />
      <div className="fixed top-4 right-4 w-8 h-8 border-4 border-foreground bg-status-yellow shadow-[2px_2px_0px_#1a1a1a]" />
      <div className="fixed bottom-4 left-4 w-8 h-8 border-4 border-foreground bg-status-green shadow-[2px_2px_0px_#1a1a1a]" />
      <div className="fixed bottom-4 right-4 w-8 h-8 border-4 border-foreground bg-primary shadow-[2px_2px_0px_#1a1a1a]" />
      

      <div className="container mx-auto px-6 py-16 md:py-20">
        <div className="text-center max-w-4xl mx-auto mb-16 md:mb-20 animate-fade-in">
          
          <div className="relative inline-block mb-6">
            <h1 className="mt-20 font-pixel text-5xl sm:text-6xl md:text-6xl lg:text-7xl text-foreground tracking-wider">
              KNOLI
            </h1>
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-foreground" />
            <div className="absolute -bottom-4 left-2 right-2 h-1 bg-foreground/50" />
          </div>
          
          <p className="mt-8 font-pixel text-xs md:text-sm mb-2 text-status-yellow uppercase tracking-widest">
            [ FLASHCARD QUEST ]
          </p>
          
          <div className="flex justify-center items-center gap-3 mb-8">
            <PixelCoin className="w-6 h-6" />
            <p className="font-retro text-xl md:text-2xl text-muted-foreground">
              Level Up Your Brain!
            </p>
            <PixelCoin className="w-6 h-6" />
          </div>
          
          <div
            className="
              inline-flex flex-wrap sm:flex-nowrap items-center
              gap-2 sm:gap-3 md:gap-4
              border-4 border-foreground
              bg-card
              px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3
              mb-4
              shadow-[4px_4px_0px_var(--color-foreground)]
            "
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-status-red border-2 border-foreground" />
              <span className="font-pixel text-[10px] sm:text-xs tracking-wide">
                NEW
              </span>
            </div>

            <div className="w-[2px] h-4 sm:h-5 md:h-6 bg-foreground" />

            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-status-yellow border-2 border-foreground" />
              <span className="font-pixel text-[10px] sm:text-xs tracking-wide">
                LEARNING
              </span>
            </div>

            <div className="w-[2px] h-4 sm:h-5 md:h-6 bg-foreground" />

            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-status-green border-2 border-foreground" />
              <span className="font-pixel text-[10px] sm:text-xs tracking-wide">
                MASTERED
              </span>
            </div>
          </div>

          
          <div className="mt-4 flex gap-4 md:gap-6 justify-center text-primary-foreground flex-wrap mb-6">
            <Button 
            onClick={() => navigate("/auth", {state: {mode: "signup"}})} 
            className="min-w-[180px] sm:min-w-[240px] bg-primary py-2 sm:py-6"
            >
              <span className="mr-2">▶</span> NEW GAME
            </Button>
            <Button 
            variant="outline" 
            onClick={() => navigate("/auth", {state: {mode: "login"}})} 
            className="min-w-[180px] sm:min-w-[240px] py-2 sm:py-6">
              <span className="mr-2">↻</span> CONTINUE
            </Button>
          </div>
          
          <div className="font-pixel text-xs text-muted-foreground mb-25">
            INSERT COIN TO START<span className="blink">_</span>
          </div>
        </div>

    
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto mb-16 md:mb-20">
          <Card className="animate-slide-up group hover:-translate-y-1 transition-transform" style={{ animationDelay: "0ms" }}>
            <CardHeader>
              <div className="w-16 h-16 border-4 border-foreground bg-status-green flex items-center justify-center mb-4 shadow-[3px_3px_0px_hsl(var(--foreground))] group-hover:shadow-[4px_4px_0px_hsl(var(--foreground))] transition-shadow">
                <Brain className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle>SMART TRACKING</CardTitle>
              <CardDescription>
                Traffic light system: RED → YELLOW → GREEN. Level up each card!
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="animate-slide-up group hover:-translate-y-1 transition-transform" style={{ animationDelay: "100ms" }}>
            <CardHeader>
              <div className="w-16 h-16 border-4 border-foreground bg-primary flex items-center justify-center mb-4 shadow-[3px_3px_0px_hsl(var(--foreground))] group-hover:shadow-[4px_4px_0px_hsl(var(--foreground))] transition-shadow">
                <Zap className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle>AI POWER-UP</CardTitle>
              <CardDescription>
                Upload docs and let AI generate flashcards. Unlock bonus cards!
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="animate-slide-up group hover:-translate-y-1 transition-transform" style={{ animationDelay: "200ms" }}>
            <CardHeader>
              <div className="w-16 h-16 border-4 border-foreground bg-status-yellow flex items-center justify-center mb-4 shadow-[3px_3px_0px_hsl(var(--foreground))] group-hover:shadow-[4px_4px_0px_hsl(var(--foreground))] transition-shadow">
                <Target className="w-8 h-8 text-foreground" />
              </div>
              <CardTitle>DECK BUILDER</CardTitle>
              <CardDescription>
                Create custom decks. Build your knowledge inventory!
              </CardDescription>
            </CardHeader>
          </Card>
        </div>


        <div className="max-w-4xl mx-auto">
          <Card className="animate-fade-in">
            <CardHeader className="text-center border-b-4 border-foreground">
              <CardTitle className="text-xl">HOW TO PLAY</CardTitle>
              <CardDescription className="text-xl">Traffic Light Learning System</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 shrink-0 border-4 border-foreground bg-status-red shadow-[3px_3px_0px_hsl(var(--foreground))] flex items-center justify-center">
                  <span className="font-pixel text-xs text-primary-foreground">1</span>
                </div>
                <div>
                  <h3 className="font-pixel text-sm mb-2 text-status-red">LEVEL 1 - RED</h3>
                  <p className="font-retro text-xl text-muted-foreground">
                    New cards start here. Practice to level up!
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 shrink-0 border-4 border-foreground bg-status-yellow shadow-[3px_3px_0px_hsl(var(--foreground))] flex items-center justify-center">
                  <span className="font-pixel text-xs text-foreground">2</span>
                </div>
                <div>
                  <h3 className="font-pixel text-sm mb-2 text-status-yellow">LEVEL 2 - YELLOW</h3>
                  <p className="font-retro text-xl text-muted-foreground">
                    Got it right once! Keep going for mastery.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 shrink-0 border-4 border-foreground bg-status-green shadow-[3px_3px_0px_hsl(var(--foreground))] flex items-center justify-center">
                  <span className="font-pixel text-xs text-primary-foreground">3</span>
                </div>
                <div>
                  <h3 className="font-pixel text-sm mb-2 text-status-green">LEVEL 3 - GREEN</h3>
                  <p className="font-retro text-xl text-muted-foreground">
                    Two correct in a row! Achievement unlocked! 🏆
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="text-center mt-12 md:mt-16">
          <div className="inline-flex items-center gap-4 border-4 border-foreground bg-card px-6 py-3 shadow-[4px_4px_0px_var(--color-foreground)]">
            <span className="font-pixel text-xs">© 2025 KNOLI SYSTEMS</span>
          </div>
          <p className="mt-4 font-pixel text-[10px] sm:text-xs text-muted-foreground">
            CREDITS: 1111 <span className="inline-block mx-2">|</span> HIGH SCORE: ???
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;