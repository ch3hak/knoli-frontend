import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { ArrowLeft, Plus, Play, Edit, Trash2, BookOpen, Loader2 } from "lucide-react";
import PixelCoin from "../pixel/PixelCoin";
import { useToast } from "../../hooks/useToast";

interface Flashcard {
  _id: string;
  front: string;
  back: string;
  tags: string[];
}

interface Deck {
  _id: string;
  title: string;
  description: string;
}

type CardStatus = "red" | "yellow" | "green";

interface CardProgress {
  flashcard: { _id: string };
  status: "red" | "yellow" | "green";
}

const DeckView = () => {
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [xpToNextLevel, setXpToNextLevel] = useState(100);
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [cardProgress, setCardProgress] = useState<Map<string, CardStatus>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeckData();
  }, [id, location.key]);

  const fetchDeckData = async () => {
    try {
      setLoading(true);
      
      const deckResponse = await fetch("/api/deck/getAll", {
        credentials: "include",
      });
      
      if (!deckResponse.ok) {
        throw new Error("Failed to fetch deck");
      }
      
      const deckData = await deckResponse.json();
      const currentDeck = deckData.data.find((d: Deck) => d._id === id);
      
      if (!currentDeck) {
        toast({
          title: "⚠️ Error",
          description: "Deck not found",
        });
        navigate("/dashboard");
        return;
      }
      
      setDeck(currentDeck);
      const cardsResponse = await fetch(`/api/flashcard/getAll/${id}`, {
        credentials: "include",
      });
      
      if (cardsResponse.ok) {
        const cardsData = await cardsResponse.json();
        setCards(cardsData.data || []);
        const progressResponse = await fetch("/api/cardprogress/getAll", {
          credentials: "include",
        });
        
        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          const progressMap = new Map<string, CardStatus>();
          
          (progressData.data || []).forEach((p: CardProgress) => {
            progressMap.set(p.flashcard._id, p.status);
          });          

          setCardProgress(progressMap);
          try {
            const xpResponse = await fetch(`/api/deck/xp/${id}`, {
              credentials: "include",
            });
            
            if (xpResponse.ok) {
              const xpData = await xpResponse.json();
              setLevel(xpData.data.level || 1);
              setXp(xpData.data.xp || 0);
              setXpToNextLevel(xpData.data.xpToNextLevel || 100);
            }
          } catch (error) {
            console.error("Error fetching deck XP:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching deck data:", error);
      toast({
        title: "⚠️ Error",
        description: "Failed to load deck data",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm("Are you sure you want to delete this card?")) return;
    
    try {
      const response = await fetch(`/api/flashcard/delete/${cardId}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (response.ok) {
        toast({
          title: "Card deleted",
          description: "Flashcard has been removed",
        });
        fetchDeckData();
      } else {
        toast({
          title: "⚠️ Error",
          description: "Failed to delete card",
        });
      }
    } catch (error) {
      toast({
        title: "⚠️ Error",
        description: "Failed to connect to server",
      });
    }
  };

  const getStatusBg = (status: CardStatus) => {
    switch (status) {
      case "green": return "bg-status-green";
      case "yellow": return "bg-status-yellow";
      case "red": return "bg-status-red";
      default: return "bg-status-red";
    }
  };

  const getStatusBorder = (status: CardStatus) => {
    switch (status) {
      case "green": return "border-status-green";
      case "yellow": return "border-status-yellow";
      case "red": return "border-status-red";
      default: return "border-status-red";
    }
  };

  const getStatusLabel = (cardId: string): CardStatus => {
    return cardProgress.get(cardId) || "red";
  };

  const getStatusCounts = () => {
    const counts = { red: 0, yellow: 0, green: 0 };
    cards.forEach(card => {
      const status = getStatusLabel(card._id);
      counts[status]++;
    });
    return counts;
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 scanlines flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p className="font-pixel text-lg">LOADING...</p>
        </div>
      </div>
    );
  }

  if (!deck) {
    return null;
  }

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen p-6 scanlines">
      <div className="fixed top-4 left-4 w-6 h-6 border-4 border-foreground bg-status-red" />
      <div className="fixed top-4 right-4 w-6 h-6 border-4 border-foreground bg-status-yellow" />
      <div className="fixed bottom-4 left-4 w-6 h-6 border-4 border-foreground bg-status-green" />
      <div className="fixed bottom-4 right-4 w-6 h-6 border-4 border-foreground bg-primary" />

      <div className="mt-10 sm:mt-8 max-w-5xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <Button 
            variant="ghost"
            onClick={() => navigate("/dashboard")} 
            className="mb-4 sm:mb-7 hidden sm:flex"
          >
            <ArrowLeft className="w-4 h-4" />
            BACK TO DASHBOARD
          </Button>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-6 sm:gap-10">
              <Card className="px-2">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <PixelCoin className="w-6 h-6" />
                    <span className="font-pixel text-sm">
                      <span className="sm:hidden">{level}</span>
                      <span className="hidden sm:inline">LVL {level}</span>
                    </span>
                  </div>
                  <div className="sm:w-25 h-2 bg-muted border-2 border-foreground">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${(xp / xpToNextLevel) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </Card>
              <div>
                <h1 className="font-pixel text-2xl sm:text-3xl mb-0">{deck.title.toUpperCase()}</h1>
                <p className="font-retro text-xl text-muted-foreground">{deck.description || " "}</p>
              </div>
            </div>
            
            {cards.length > 0 && (
              <div className="mt-2 flex gap-4 sm:gap-3">
                <Button
                  onClick={() => navigate(`/deck/${id}/study`)}
                  className="sm:gap-2 bg-primary text-primary-foreground"
                >
                  <Play className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">START QUIZ</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/deck/${id}/card/new`)}
                  className="sm:gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">ADD CARD</span>
                </Button>
              </div>
            )}
          </div>
        </div>
        {cards.length > 0 && (
          <Card className="mb-6 px-2 py-3 sm:p-4">
            <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="w-4 sm:h-4 h-3 bg-status-red border-2 border-foreground" />
                  <span className="font-pixel text-[9px] sm:text-xs">RED: {statusCounts.red}</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="w-4 sm:h-4 h-3 bg-status-yellow border-2 border-foreground" />
                  <span className="font-pixel text-[9px] sm:text-xs">YELLOW: {statusCounts.yellow}</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="w-4 sm:h-4 h-3 bg-status-green border-2 border-foreground" />
                  <span className="font-pixel text-[9px] sm:text-xs">GREEN: {statusCounts.green}</span>
                </div>
              </div>
              <span className="font-pixel text-[9px] text-muted-foreground">TOTAL: {cards.length} CARDS</span>
            </div>
          </Card>
        )}

        {cards.length === 0 ? (
          <Card className="p-12 h-100 text-center animate-slide-up">
            <div className="w-24 h-24 sm:mt-4 mx-auto mb-6 border-4 border-foreground bg-primary flex items-center justify-center shadow-[4px_4px_0px_hsl(var(--foreground))]">
              <BookOpen className="w-12 h-12 text-primary-foreground" />
            </div>
            <h2 className="font-pixel text-xl mb-3">NO CARDS YET</h2>
            <p className="font-retro text-lg text-muted-foreground mb-8 max-w-md mx-auto">
              Your deck is empty. Add your first flashcard to start learning!
            </p>
            <Button
              onClick={() => navigate(`/deck/${id}/card/new`)}
              size="lg"
              className="bg-primary text-primary-foreground py-1 md:py-2 px-2 md:px-3"
            >
              <Plus className="w-4 h-4 mr-2" />
              <p className="text-[12px] md:text-md">ADD FIRST CARD</p>
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {cards.map((card, index) => {
              const status = getStatusLabel(card._id);
              const statusColor = status === 'green' ? 'var(--color-status-green)' : status === 'yellow' ? 'var(--color-status-yellow)' : 'var(--color-status-red)';
              return (
                <div
                    key={card._id}
                    className={`animate-slide-up overflow-hidden bg-card shadow-[4px_4px_0px_var(--color-foreground)] transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_var(--color-foreground)] cursor-pointer`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                  <div 
                    className="p-6 border-4"
                    style={{ borderColor: statusColor }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-8 h-8 border-4 border-foreground ${getStatusBg(status)} flex items-center justify-center shadow-[2px_2px_0px_hsl(var(--foreground))]`}>
                        <span className="font-pixel text-xs text-primary-foreground">
                          {status === 'red' ? 'R' : status === 'yellow' ? 'Y' : 'G'}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="mb-3">
                          <span className="font-pixel text-xs text-muted-foreground">[QUESTION]</span>
                          <p className="font-retro text-3xl">{card.front}</p>
                        </div>
                        {card.tags && card.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {card.tags.map((tag, i) => (
                              <span key={i} className="px-2 py-0.5 border-2 border-foreground bg-muted font-pixel text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => navigate(`/deck/${id}/card/${card._id}/edit`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="red" 
                          size="icon"
                          onClick={() => handleDeleteCard(card._id)}
                        >
                          <Trash2 className="w-4 h-4 text-card-foreground" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeckView;