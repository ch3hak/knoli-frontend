import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { ArrowLeft, Eye, EyeOff, Filter, X } from "lucide-react";
import { useToast } from "../../hooks/useToast";
import { useIsMobile } from "../../hooks/useMobile";
import PixelCoin from "../pixel/PixelCoin";

type CardStatus = 'red' | 'yellow' | 'green';

interface Flashcard {
  _id: string;
  deck: string;
  front: string;
  back: string;
  tags: string[];
  media?: {
    frontImage?: string;
    backImage?: string;
  };
}

interface CardProgress {
  _id: string;
  user: string;
  flashcard: Flashcard;
  status: CardStatus;
  correctStreak: number;
  updatedAt: string;
}

interface StudyCard extends Flashcard {
  status: CardStatus;
  previousStatus?: CardStatus;
  seenThisSession: boolean;
  lastAnsweredAt?: number;
  correctStreak: number;
  deckTitle: string;
}

interface Deck {
  _id: string;
  title: string;
  description?: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
}

const REPEAT_INTERVALS: Record<CardStatus, number> = {
  red: 30000,    
  yellow: 60000, 
  green: 120000, 
};

const XP_REWARDS: Record<CardStatus, number> = {
  red: 0,
  yellow: 5,
  green: 15,
};

const StudyAll = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  
  const [cards, setCards] = useState<StudyCard[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [studyQueue, setStudyQueue] = useState<string[]>([]);
  const [currentCardId, setCurrentCardId] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [totalXP, setTotalXP] = useState(0);
  const [completedCards, setCompletedCards] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const minSwipeDistance = 100;

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Using cookie-based auth - no need to manually handle tokens
      const decksResponse = await fetch('/api/deck/getAll', {
        credentials: 'include', // This sends the httpOnly cookie automatically
      });
      
      if (!decksResponse.ok) {
        if (decksResponse.status === 401 || decksResponse.status === 403) {
          toast({
            title: 'Session Expired',
            description: 'Please login again',
          });
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch decks');
      }
      
      const decksData = await decksResponse.json();
      const fetchedDecks: Deck[] = decksData.data || [];
      setDecks(fetchedDecks);

      if (fetchedDecks.length === 0) {
        setLoading(false);
        toast({
          title: 'No Decks Found',
          description: 'Create a deck first!',
        });
        return;
      }
      
      const allCardsPromises = fetchedDecks.map(deck =>
        fetch(`/api/flashcard/getAll/${deck._id}`, {
          credentials: 'include',
        }).then(res => res.json())
      );
      
      const allCardsResponses = await Promise.all(allCardsPromises);
      const allFlashcards: Flashcard[] = [];
      
      allCardsResponses.forEach((response, index) => {
        const deckCards = response.data || [];
        deckCards.forEach((card: Flashcard) => {
          allFlashcards.push({
            ...card,
            deckTitle: fetchedDecks[index].title
          } as any);
        });
      });
      
      if (allFlashcards.length === 0) {
        setLoading(false);
        toast({
          title: 'No Flashcards Found',
          description: 'Add some cards to your decks!',
        });
        return;
      }

      const progressResponse = await fetch('/api/cardprogress/getAll', {
        credentials: 'include',
      });
      const progressData = await progressResponse.json();
      const progressMap = new Map<string, CardProgress>();
      
      (progressData.data || []).forEach((prog: CardProgress) => {
        progressMap.set(prog.flashcard._id, prog);
      });

      const studyCards: StudyCard[] = allFlashcards.map(card => {
        const progress = progressMap.get(card._id);
        const deckTitle = fetchedDecks.find(d => d._id === card.deck)?.title || 'Unknown Deck';
        
        return {
          ...card,
          status: progress?.status || 'red',
          correctStreak: progress?.correctStreak || 0,
          seenThisSession: false,
          deckTitle
        };
      });

      setCards(studyCards);

      const tags = [...new Set(studyCards.flatMap(c => c.tags || []))].sort();
      setAllTags(tags);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load study data',
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cards.length === 0) return;

    const filteredCards = selectedTags.length > 0
      ? cards.filter(c => (c.tags || []).some(t => selectedTags.includes(t)))
      : cards;
    
    const now = Date.now();
    const sortedCards = [...filteredCards]
      .filter(card => {
        if (!card.lastAnsweredAt) return true;
        const interval = REPEAT_INTERVALS[card.status];
        return now - card.lastAnsweredAt >= interval;
      })
      .sort((a, b) => {
        const statusOrder: Record<CardStatus, number> = { red: 0, yellow: 1, green: 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      });
    
    const queue = sortedCards.map(c => c._id);
    setStudyQueue(queue);
    
    if (queue.length > 0 && !currentCardId) {
      setCurrentCardId(queue[0]);
    }
  }, [cards, selectedTags]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      cards.forEach(card => {
        if (card.lastAnsweredAt && !studyQueue.includes(card._id)) {
          const repeatInterval = REPEAT_INTERVALS[card.status];
          if (now - card.lastAnsweredAt >= repeatInterval) {
            setStudyQueue(prev => [...prev, card._id]);
            toast({
              title: 'Card Ready!',
              description: `"${card.front.substring(0, 30)}..." is back`,
              duration: 2000,
            });
          }
        }
      });
    }, 10000);
    
    return () => clearInterval(interval);
  }, [cards, studyQueue]);

  const currentCard = cards.find(c => c._id === currentCardId);
  const progress = studyQueue.length > 0 ? ((completedCards) / (completedCards + studyQueue.length)) * 100 : 100;

  const getStatusColor = (status: CardStatus): string => {
    switch (status) {
      case 'red': return 'hsl(var(--status-red))';
      case 'yellow': return 'hsl(var(--status-yellow))';
      case 'green': return 'hsl(var(--status-green))';
    }
  };

  const getStatusBg = (status: CardStatus): string => {
    switch (status) {
      case 'red': return 'bg-status-red';
      case 'yellow': return 'bg-status-yellow';
      case 'green': return 'bg-status-green';
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
    if (!isFlipped || answered) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isFlipped || answered || touchStart === null) return;
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    setDragOffset(currentTouch - touchStart);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || answered) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) handleAnswer('red');
    else if (isRightSwipe) handleAnswer('green');
    
    setDragOffset(0);
    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleAnswer = async (newStatus: CardStatus) => {
    if (!currentCard) return;
    
    setAnswered(true);
    setSwipeDirection(newStatus === 'green' ? 'right' : 'left');
    
    const xpEarned = XP_REWARDS[newStatus];
    setTotalXP(prev => prev + xpEarned);
    
    try {
      await fetch('/api/cardprogress/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          flashcardId: currentCard._id,
          answer: newStatus
        })
      });

      const deck = decks.find(d => d._id === currentCard.deck);
      if (deck && xpEarned > 0) {
        await fetch(`/api/deck/xp/${deck._id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            xpToAdd: xpEarned
          })
        });
      }

      const updatedCards = cards.map(card => {
        if (card._id === currentCard._id) {
          return {
            ...card,
            previousStatus: card.status,
            status: newStatus,
            seenThisSession: true,
            lastAnsweredAt: Date.now(),
            correctStreak: newStatus === 'green' ? card.correctStreak + 1 : 0,
          };
        }
        return card;
      });
      setCards(updatedCards);
      
      const messages = {
        red: { title: "WRONG!", desc: "Card stays at RED" },
        yellow: { title: "ALMOST!", desc: "Card at YELLOW • +5 XP" },
        green: { title: "CORRECT!", desc: "Card leveled up! • +15 XP" }
      };
      
      toast({
        title: messages[newStatus].title,
        description: messages[newStatus].desc,
        duration: 2000,
      });

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
            title: '🏆 SESSION COMPLETE!',
            description: `You earned ${totalXP} XP this session!`,
            duration: 3000,
          });
          setTimeout(() => navigate("/dashboard"), 1500);
        }
      }, 500);
    } catch (error) {
      console.error('Error recording answer:', error);
      toast({
        title: 'Error',
        description: 'Failed to save progress',
      });
      setAnswered(false);
      setSwipeDirection(null);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const getSwipeClass = () => {
    if (swipeDirection === 'left') return 'swipe-left';
    if (swipeDirection === 'right') return 'swipe-right';
    return '';
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center scanlines">
        <div className="text-center">
          <p className="font-pixel text-lg mb-4">LOADING CARDS...</p>
          <div className="blink">_</div>
        </div>
      </div>
    );
  }

  if (!currentCard && studyQueue.length === 0) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center scanlines">
        <div className="text-center">
          <p className="font-pixel text-lg mb-4">
            {selectedTags.length > 0 ? "NO CARDS MATCH SELECTED TAGS" : "NO CARDS TO STUDY"}
          </p>
          <div className="flex gap-4 justify-center">
            {selectedTags.length > 0 && (
              <Button 
                onClick={() => setSelectedTags([])}
              >
                CLEAR FILTERS
              </Button>
            )}
            <Button onClick={() => navigate("/dashboard")}>BACK TO DASHBOARD</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 relative scanlines">
      <div className="fixed top-4 left-4 w-6 h-6 border-4 border-foreground bg-status-red" />
      <div className="fixed top-4 right-4 w-6 h-6 border-4 border-foreground bg-status-yellow" />
      <div className="fixed bottom-4 left-4 w-6 h-6 border-4 border-foreground bg-status-green" />
      
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button 
              onClick={() => navigate("/dashboard")} 
              className="font-pixel text-xs"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              EXIT
            </Button>
            
            <Button
              onClick={() => setShowFilters(!showFilters)}
              className="font-pixel text-xs"
            >
              <Filter className="w-4 h-4 mr-2" />
              FILTER BY TAGS
              {selectedTags.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-status-yellow text-foreground">
                  {selectedTags.length}
                </span>
              )}
            </Button>
          </div>

          {showFilters && (
            <div className="mb-6 p-4 border-4 border-foreground bg-card shadow-[4px_4px_0px_hsl(var(--foreground))]">
              <div className="flex items-center justify-between mb-3">
                <span className="font-pixel text-xs">SELECT TAGS TO FILTER:</span>
                {selectedTags.length > 0 && (
                  <Button
                    onClick={() => setSelectedTags([])}
                    className="font-pixel text-xs p-1"
                  >
                    <X className="w-3 h-3 mr-1" />
                    CLEAR ALL
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`
                      px-3 py-1 font-pixel text-xs border-2 border-foreground transition-all
                      ${selectedTags.includes(tag) 
                        ? 'bg-primary text-primary-foreground shadow-[2px_2px_0px_hsl(var(--foreground))]' 
                        : 'bg-muted hover:bg-muted/80'
                      }
                    `}
                  >
                    #{tag.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-pixel text-lg md:text-xl">STUDY ALL</h1>
              <p className="font-retro text-xl text-muted-foreground">
                {studyQueue.length} cards remaining
                {selectedTags.length > 0 && ` • Filtered by ${selectedTags.length} tag(s)`}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="border-4 border-foreground bg-card px-3 py-2 shadow-[2px_2px_0px_hsl(var(--foreground))]">
                <div className="flex items-center gap-2">
                  <PixelCoin className="w-5 h-5" />
                  <span className="font-pixel text-xs">SESSION XP: {totalXP}</span>
                </div>
              </div>
              
              <Button 
                onClick={() => setShowAnswer(!showAnswer)}
                className="p-2"
              >
                {showAnswer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          <div className="h-6 border-4 border-foreground bg-muted shadow-[3px_3px_0px_hsl(var(--foreground))]">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {currentCard && (
          <>
            <div className="mb-4 flex items-center justify-center gap-2 flex-wrap">
              <div className={`w-6 h-6 border-2 border-foreground ${getStatusBg(currentCard.status)}`} />
              <span className="font-pixel text-sm" style={{ color: getStatusColor(currentCard.status) }}>
                {getStatusLabel(currentCard.status)}
              </span>
              {currentCard.seenThisSession && currentCard.previousStatus && (
                <span className="font-pixel text-xs text-muted-foreground ml-2">
                  (was {currentCard.previousStatus.toUpperCase()})
                </span>
              )}
              <span className="font-pixel text-xs text-muted-foreground ml-4">
                FROM: {currentCard.deckTitle.toUpperCase()}
              </span>
            </div>

            {currentCard.tags && currentCard.tags.length > 0 && (
              <div className="mb-4 flex justify-center gap-2 flex-wrap">
                {currentCard.tags.map(tag => (
                  <span 
                    key={tag}
                    className={`
                      px-2 py-0.5 font-pixel text-xs border-2 border-foreground
                      ${selectedTags.includes(tag) ? 'bg-primary text-primary-foreground' : 'bg-muted'}
                    `}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mb-8">
              <div
                ref={cardRef}
                className={`min-h-[400px] cursor-pointer ${getSwipeClass()} transition-transform duration-100`}
                style={{
                  transform: dragOffset ? `translateX(${dragOffset}px) rotate(${dragOffset * 0.05}deg)` : undefined,
                }}
                onClick={() => !answered && setIsFlipped(!isFlipped)}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <Card 
                  className="min-h-[400px] relative overflow-hidden"
                  style={{
                    border: `4px solid ${getStatusColor(currentCard.status)}`,
                  }}
                >
                  <div 
                    className="absolute top-0 left-0 w-8 h-8"
                    style={{ backgroundColor: getStatusColor(currentCard.status) }}
                  >
                    <span className="font-pixel text-xs text-primary-foreground absolute top-1 left-1">
                      {currentCard.status === 'red' ? 'R' : currentCard.status === 'yellow' ? 'Y' : 'G'}
                    </span>
                  </div>
                  <div 
                    className="absolute top-0 right-0 w-8 h-8"
                    style={{ backgroundColor: getStatusColor(currentCard.status) }}
                  />
                  
                  <div className="absolute top-0 left-0 right-1/2 bottom-1/2 bg-card opacity-20" />
                  
                  <div className="p-8 md:p-12 h-full flex items-center justify-center min-h-[400px]">
                    <div className="text-center w-full">
                      <div className="flex justify-center gap-2 mb-6">
                        <div className={`w-4 h-4 border-2 border-foreground ${!isFlipped ? 'bg-status-yellow' : 'bg-muted'}`} />
                        <div className={`w-4 h-4 border-2 border-foreground ${isFlipped ? 'bg-status-green' : 'bg-muted'}`} />
                      </div>
                      
                      <p className="font-pixel text-xs uppercase tracking-wider text-muted-foreground mb-6">
                        {isFlipped ? "[ ANSWER ]" : "[ QUESTION ]"}
                      </p>
                      
                      <p className="font-retro text-2xl md:text-3xl leading-relaxed">
                        {isFlipped ? currentCard.back : currentCard.front}
                      </p>
                      
                      {showAnswer && !isFlipped && (
                        <div className="mt-6 p-4 border-2 border-dashed border-muted-foreground/50 bg-muted/50">
                          <p className="font-pixel text-xs text-muted-foreground mb-2">[ PEEK ]</p>
                          <p className="font-retro text-lg text-muted-foreground">{currentCard.back}</p>
                        </div>
                      )}
                      
                      {!isFlipped && !showAnswer && (
                        <p className="font-pixel text-xs text-muted-foreground mt-8">
                          TAP TO FLIP<span className="blink">_</span>
                        </p>
                      )}
                      
                      {isFlipped && isMobile && !answered && (
                        <div className="mt-8 font-pixel text-xs text-muted-foreground space-y-1">
                          <p>← SWIPE LEFT = WRONG</p>
                          <p>SWIPE RIGHT = CORRECT →</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {isFlipped && !answered && !isMobile && (
              <div className="grid grid-cols-3 gap-4">
                <Button
                  onClick={() => handleAnswer('red')}
                  className="bg-status-red h-20 font-pixel text-xs"
                >
                  <div className="text-center">
                    <div>WRONG</div>
                    <div className="opacity-80 mt-1">→ RED</div>
                  </div>
                </Button>
                <Button
                  onClick={() => handleAnswer('yellow')}
                  className="bg-status-yellow h-20 font-pixel text-xs"
                >
                  <div className="text-center">
                    <div>ALMOST</div>
                    <div className="opacity-80 mt-1">→ YELLOW +5XP</div>
                  </div>
                </Button>
                <Button
                  onClick={() => handleAnswer('green')}
                  className="bg-status-green h-20 font-pixel text-xs"
                >
                  <div className="text-center">
                    <div>CORRECT</div>
                    <div className="opacity-80 mt-1">→ GREEN +15XP</div>
                  </div>
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StudyAll;