import { useState, useRef, useEffect } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "../../hooks/useToast";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { useIsMobile } from "../../hooks/useMobile";
import PixelCoin from "../pixel/PixelCoin";

type CardStatus = 'red' | 'yellow' | 'green';

interface Flashcard {
  _id: string;
  front: string;
  back: string;
  tags: string[];
  status: CardStatus;
  correctStreak: number;
  seenThisSession: boolean;
}

interface DeckXP {
  level: number;
  xp: number;
  xpToNextLevel: number;
}

const XP_REWARDS: Record<CardStatus, number> = {
  red: 0,
  yellow: 5,
  green: 15,
};

const FlashcardStudy = () => {
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const deckId = id!;
  const onExit = () => navigate(`/deck/${deckId}`);
  const onComplete = () => navigate(`/deck/${deckId}`);
  
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [studyQueue, setStudyQueue] = useState<string[]>([]);
  const [currentCardId, setCurrentCardId] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [deckXP, setDeckXP] = useState<DeckXP>({ level: 1, xp: 0, xpToNextLevel: 100 });
  const [completedCards, setCompletedCards] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const isMobile = useIsMobile();  
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  const minSwipeDistance = 100;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const cardsResponse = await fetch(`/api/flashcard/getAll/${deckId}`, {
          credentials: "include",
        });
        
        if (!cardsResponse.ok) {
          throw new Error("Failed to fetch flashcards");
        }
        
        const cardsData = await cardsResponse.json();
        const flashcards = cardsData.data || [];
        
        if (flashcards.length === 0) {
          toast({
            title: "⚠️ No Cards",
            description: "This deck has no flashcards yet",
          });
          return;
        }
        
        const progressResponse = await fetch("/api/cardprogress/getAll", {
          credentials: "include",
        });
        
        let progressMap = new Map<string, { status: CardStatus; correctStreak: number }>();
        
        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          (progressData.data || []).forEach((p: any) => {
            progressMap.set(p.flashcard._id, {
              status: p.status as CardStatus,
              correctStreak: p.correctStreak
            });
          });
        }
        
        const cardsWithProgress: Flashcard[] = flashcards.map((card: any) => {
          const progress = progressMap.get(card._id);
          return {
            _id: card._id,
            front: card.front,
            back: card.back,
            tags: card.tags || [],
            status: progress?.status || 'red',
            correctStreak: progress?.correctStreak || 0,
            seenThisSession: false,
          };
        });
        
        setCards(cardsWithProgress);
        
        const queue = cardsWithProgress
          .sort((a, b) => {
            const statusOrder: Record<CardStatus, number> = { red: 0, yellow: 1, green: 2 };
            return statusOrder[a.status] - statusOrder[b.status];
          })
          .map(c => c._id);
        
        setStudyQueue(queue);
        if (queue.length > 0) {
          setCurrentCardId(queue[0]);
        }
        
        try {
          const xpResponse = await fetch(`/api/deck/xp/${deckId}`, {
            credentials: "include",
          });
          
          if (xpResponse.ok) {
            const xpData = await xpResponse.json();
            setDeckXP({
              level: xpData.data.level || 1,
              xp: xpData.data.xp || 0,
              xpToNextLevel: xpData.data.xpToNextLevel || 100
            });
          }
        } catch (error) {
          console.error("Error fetching deck XP:", error);
        }
        
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "⚠️ Error",
          description: "Failed to load flashcards",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [deckId, toast]);

  const currentCard = cards.find(c => c._id === currentCardId);
  const progress = studyQueue.length > 0 ? ((completedCards) / (completedCards + studyQueue.length)) * 100 : 100;

  const getStatusColor = (status: CardStatus): string => {
    switch (status) {
      case 'red': return '#ef4444';
      case 'yellow': return '#eab308';
      case 'green': return '#22c55e';
    }
  };

  const getStatusBg = (status: CardStatus): string => {
    switch (status) {
      case 'red': return 'bg-red-500';
      case 'yellow': return 'bg-yellow-500';
      case 'green': return 'bg-green-500';
    }
  };

  const getStatusLabel = (status: CardStatus) => {
    switch (status) {
      case 'red': return 'RED - NEW';
      case 'yellow': return 'YELLOW - LEARNING';
      case 'green': return 'GREEN - MASTERED';
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (!isMobile || !isFlipped || answered) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || !isFlipped || answered || touchStart === null) return;
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    setDragOffset(currentTouch - touchStart);
  };

  const onTouchEnd = () => {
    if (!isMobile || !touchStart || !touchEnd || answered) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      handleAnswer('red');
    } else if (isRightSwipe) {
      handleAnswer('green');
    }
    
    setDragOffset(0);
    setTouchStart(null);
    setTouchEnd(null);
  };

  const addXP = async (amount: number) => {
    try {
      const response = await fetch(`/api/deck/xp/${deckId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          xpToAdd: amount
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update XP');
      }
      
      const result = await response.json();
      const { level: newLevel, xp: newXP, xpToNextLevel: newXPToNext, leveledUp } = result.data;
      
      setDeckXP({
        level: newLevel,
        xp: newXP,
        xpToNextLevel: newXPToNext
      });
      
      if (leveledUp) {
        toast({
          title: "🎮 LEVEL UP!",
          description: `Deck reached Level ${newLevel}!`,
        });
      }
    } catch (error) {
      console.error('Error updating XP:', error);
    }
  };
  const handleAnswer = async (selectedStatus: CardStatus) => {
    if (!currentCard || answered) return;
    
    setAnswered(true);
    setSwipeDirection(selectedStatus === 'green' ? 'right' : 'left');
    
    const xpEarned = XP_REWARDS[selectedStatus];
    if (xpEarned > 0) {
      addXP(xpEarned);
    }
    
    const wasCorrect = selectedStatus !== 'red';
    
    try {
      const response = await fetch('/api/cardprogress/new', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flashcardId: currentCard._id,
          answer: selectedStatus
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update progress');
      }
      
      const result = await response.json();
      const updatedStatus = result.data.status as CardStatus;
      const updatedStreak = result.data.correctStreak;
      
      setCards(prev => prev.map(card => {
        if (card._id === currentCard._id) {
          return {
            ...card,
            status: updatedStatus,
            correctStreak: updatedStreak,
            seenThisSession: true,
          };
        }
        return card;
      }));
      
      const messages = {
        red: { title: "WRONG!", desc: "Card stays at RED", xp: "" },
        yellow: { title: "ALMOST!", desc: "Card at YELLOW", xp: "+5 XP" },
        green: { title: "CORRECT!", desc: "Card leveled up!", xp: "+15 XP" }
      };
      
      toast({
        title: messages[selectedStatus].title,
        description: `${messages[selectedStatus].desc} ${messages[selectedStatus].xp}`,
      });
      
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: "⚠️ Error",
        description: "Failed to save progress",
      });
    }

    setTimeout(() => {
      const newQueue = studyQueue.filter(id => id !== currentCardId);
      setStudyQueue(newQueue);
      setCompletedCards(prev => prev + 1);
      
      if (newQueue.length > 0) {
        setCurrentCardId(newQueue[0]);
        setIsFlipped(false);
        setAnswered(false);
        setSwipeDirection(null);
        setShowAnswer(false);
      } else {
        toast({
          title: "🏆 SESSION COMPLETE!",
          description: `You earned ${deckXP.xp} XP this session!`,
        });
        setTimeout(onComplete, 2000);
      }
    }, 500);
  };

  const getSwipeClass = () => {
    if (swipeDirection === 'left') return 'animate-swipe-left';
    if (swipeDirection === 'right') return 'animate-swipe-right';
    return '';
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p className="font-bold text-lg">LOADING...</p>
        </div>
      </div>
    );
  }

  if (!currentCard || studyQueue.length === 0) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="font-pixel text-lg mb-4">YOU'RE ALL DONE</p>
          <Button
            onClick={onExit}          >
            BACK TO DECK
          </Button>        
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 relative scanlines">
      <div className="hidden md:block fixed top-4 left-4 w-6 h-6 border-4 border-foreground bg-status-red" />
      <div className="hidden md:block fixed top-4 right-4 w-6 h-6 border-4 border-foreground bg-status-yellow" />
      <div className="hidden md:block fixed bottom-4 left-4 w-6 h-6 border-4 border-foreground bg-status-green" />
      <div className="hidden md:block fixed bottom-4 right-4 w-6 h-6 border-4 border-foreground bg-primary" />

      <div className="max-w-3xl mx-auto">
        <div className="mt-4 mb-6 sm:mt-3 sm:mb-5 animate-fade-in">
          {/* <Button
            variant="ghost"
            onClick={onExit}
            className="hidden sm:flex sm:mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <p className="text-sm">BACK TO DECK</p>
          </Button> */}

          <div className="flex items-center gap-3 sm:flex-row sm:justify-between mb-6 sm:mb-4">
            <Button
              variant="ghost"
              onClick={onExit}
              className="p-1 mr-2 bg-primary text-primary-foreground"
            >
              <ArrowLeft className="w-6 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-[16px] sm:text-3xl sm:mt-2 font-bold">
                STUDY MODE
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                {studyQueue.length} cards remaining
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="border-4  bg-card px-2 py-2 shadow-[4px_4px_0px_var(--color-foreground)]">
                <div className="flex items-center gap-5 sm:gap-1">
                  <PixelCoin className="w-4 h-4" />
                  <span className="font-pixel text-xs">
                    <span className="sm:hidden">{deckXP.level}</span>
                    <span className="max-sm:hidden">LVL {deckXP.level}</span>
                  </span>
                </div>

                <div className="w-12 sm:w-20 h-2 bg-muted border-2 border-foreground mt-1">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${(deckXP.xp / deckXP.xpToNextLevel) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="h-4 border-4 bg-card">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>



        <div className="flex items-center justify-center gap-2">
          {/* <div className={`w-6 h-6 border-2 border-black ${getStatusBg(currentCard.status)}`} />
          <span className="font-bold text-sm" style={{ color: getStatusColor(currentCard.status) }}>
            {getStatusLabel(currentCard.status)}
          </span> */}
          {currentCard.seenThisSession && (
            <span className="font-bold text-xs text-gray-500 ml-2">
              (Streak: {currentCard.correctStreak})
            </span>
          )}
        </div>

        <div className="mb-8 animate-slide-up">
          <div
            ref={cardRef}
            className={`h-[386px] sm:min-h-[300px] pixel-card cursor-pointer ${getSwipeClass()} transition-transform duration-100`}
            style={{
              transform: dragOffset ? `translateX(${dragOffset}px) rotate(${dragOffset * 0.05}deg)` : undefined,
            }}
            onClick={() => !answered && setIsFlipped(!isFlipped)}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div 
              className="h-[380px] sm:min-h-[300px] relative bg-card border-4 pb-10 flex flex-col"
              style={{ borderColor: getStatusColor(currentCard.status) }}
            >              
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="text-center w-full flex flex-col h-full">
                  <div className="flex justify-center gap-2 mb-4 mt-8 md:mt-12 flex-shrink-0">
                    <div className={`w-4 h-4 border-2 border-muted-foreground ${!isFlipped ? 'bg-primary' : ''}`} />
                    <div className={`w-4 h-4 border-2 border-muted-foreground ${isFlipped ? 'bg-primary' : ''}`} />
                  </div>
                  
                  <p className="font-pixel text-sm text-muted-foreground uppercase tracking-wider mb-4 flex-shrink-0 px-8 md:px-12">
                    {isFlipped ? "[ ANSWER ]" : "[ QUESTION ]"}
                  </p>
                  
                  <div className="flex-1 overflow-y-auto px-8 md:px-12 pb-4">
                    <div className="flex items-center justify-center min-h-full">
                      <p className="text-2xl sm:text-3xl mr-10 ml-10">
                        {isFlipped ? currentCard.back : currentCard.front}
                      </p>
                    </div>
                  </div>
                  
                  {!isFlipped && !showAnswer && (
                    <p className="font-pixel text-[10px] text-muted-foreground mb-8 md:mb-12 flex-shrink-0">
                      TAP TO FLIP<span className="animate-pulse">_</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {isFlipped && !answered && !isMobile && (
          <div className="grid grid-cols-3 gap-4 animate-fade-in">
            <Button
              onClick={() => handleAnswer('red')}
              className="text-primary-foreground h-18 font-pixel text-xs bg-status-red"
            >
              <div className="text-center">
                <div>WRONG</div>
                <div className="text-xs opacity-70 mt-1">RED</div>
              </div>
            </Button>

            <Button
              onClick={() => handleAnswer('yellow')}
              className="h-18 font-pixel text-xs bg-status-yellow"
            >
              <div className="text-center">
                <div>ALMOST</div>
                <div className="text-xs opacity-70 mt-1">YELLOW +5XP</div>
              </div>
            </Button>

            <Button
              onClick={() => handleAnswer('green')}
              className="h-18 font-pixel text-primary-foreground text-xs bg-status-green"
            >
              <div className="text-center">
                <div>CORRECT</div>
                <div className="text-xs opacity-70 mt-1">GREEN +15XP</div>
              </div>
            </Button>
          </div>
        )}

        {/* {isFlipped && !answered && !isMobile && (
          <div className="grid grid-cols-3 gap-4 animate-fade-in">
            <button
              onClick={() => handleAnswer('red')}
              className="h-20 bg-red-500 text-white font-bold border-4 border-black shadow-[4px_4px_0px_black] hover:bg-red-600 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
              <div className="text-center">
                <div>WRONG</div>
                <div className="opacity-80 mt-1 text-xs">→ RED</div>
              </div>
            </button>
            <button
              onClick={() => handleAnswer('yellow')}
              className="h-20 bg-yellow-500 text-black font-bold border-4 border-black shadow-[4px_4px_0px_black] hover:bg-yellow-600 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
              <div className="text-center">
                <div>ALMOST</div>
                <div className="opacity-80 mt-1 text-xs">→ YELLOW +5XP</div>
              </div>
            </button>
            <button
              onClick={() => handleAnswer('green')}
              className="h-20 bg-green-500 text-white font-bold border-4 border-black shadow-[4px_4px_0px_black] hover:bg-green-600 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
              <div className="text-center">
                <div>CORRECT</div>
                <div className="opacity-80 mt-1 text-xs">→ GREEN +15XP</div>
              </div>
            </button>
          </div>
        )} */}
        
        {isFlipped && !answered && isMobile && (
          <div className="flex justify-between items-center animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 border-4 border-black bg-status-red flex items-center justify-center">
              <ArrowLeft className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-xs">WRONG</span>
          </div>
        
          <p className="mt-2 text-muted-foreground font-pixel text-sm">SWIPE</p>
      
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs">CORRECT</span>
            <div className="w-8 h-8 border-4 border-black bg-status-green flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-primary-foreground" />
            </div>
          </div>
        </div>
        
        )}
      </div>
      
      <style>{`
        @keyframes swipe-left {
          to {
            transform: translateX(-150%) rotate(-30deg);
            opacity: 0;
          }
        }
        @keyframes swipe-right {
          to {
            transform: translateX(150%) rotate(30deg);
            opacity: 0;
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-swipe-left {
          animation: swipe-left 0.5s ease-out forwards;
        }
        .animate-swipe-right {
          animation: swipe-right 0.5s ease-out forwards;
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FlashcardStudy;