import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Plus, BookOpen, Upload, LogOut, Loader2 } from "lucide-react";
import PixelCoin from "../pixel/PixelCoin";

interface Deck {
  _id: string;
  title: string;
  description: string;
  cardCount: number;
  progress: { red: number; yellow: number; green: number };
  level: number;
  xp: number;
}

type CardStatus = "red" | "yellow" | "green";

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDecks();
  }, [location.pathname]);

  const fetchDecks = async () => {
    try {
      setLoading(true);
      setError(null);

      const decksResponse = await fetch("/api/deck/getAll", {
        credentials: "include",
      });

      if (decksResponse.status === 401 || decksResponse.status === 403) {
        navigate("/auth", { replace: true });
        return;
      }

      if (!decksResponse.ok) {
        throw new Error("Failed to fetch decks");
      }

      const decksData = await decksResponse.json();

      const progressResponse = await fetch("/api/cardprogress/getAll", {
        credentials: "include",
      });

      const progressData: any[] = progressResponse.ok
        ? (await progressResponse.json()).data
        : [];

      const decksWithProgress = await Promise.all(
        decksData.data.map(async (deck: any) => {
          let cardCount = 0;
          let progress = { red: 0, yellow: 0, green: 0 };

          try {
            const cardsResponse = await fetch(
              `/api/flashcard/getAll/${deck._id}`,
              { credentials: "include" }
            );

            if (cardsResponse.ok) {
              const cardsData = await cardsResponse.json();
              cardCount = cardsData.data.length;

              cardsData.data.forEach((card: any) => {
                const cardProgress = progressData.find(
                  (p) => p.flashcard?._id === card._id
                );

                const status: CardStatus = cardProgress?.status ?? "red";
                progress[status]++;
              });
            }
          } catch {
            console.log(`No cards found for deck ${deck._id}`);
          }

          const totalGreen = progress.green;
          const level = Math.floor(totalGreen / 5) + 1;
          const xp = (totalGreen % 5) * 20;

          return {
            _id: deck._id,
            title: deck.title,
            description: deck.description || "No description",
            cardCount,
            progress,
            level,
            xp,
          };
        })
      );

      setDecks(decksWithProgress);
    } catch (err) {
      console.error("Error fetching decks:", err);
      setError("Failed to load decks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      navigate("/", { replace: true });
    }
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

  return (
    <div className="min-h-screen p-6 scanlines">
      <div className="fixed top-4 left-4 w-6 h-6 border-4 border-foreground bg-status-red" />
      <div className="fixed top-4 right-4 w-6 h-6 border-4 border-foreground bg-status-yellow" />
      <div className="fixed bottom-4 left-4 w-6 h-6 border-4 border-foreground bg-status-green" />
      <div className="fixed bottom-4 right-4 w-6 h-6 border-4 border-foreground bg-primary" />

      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col mt-8 gap-0">
            <h1 onClick={() => navigate("/dashboard")} className="font-pixel text-2xl md:text-3xl text-primary leading-tight cursor-pointer">KNOLI</h1>
            <p className="font-retro text-lg text-muted-foreground -mt-1">
              Mission Control
            </p>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="mt-4">
            <LogOut className="w-4 h-4"/>
            <span className="hidden sm:inline ml-2">LOGOUT</span>
          </Button>
        </div>

        {error && (
          <div className="mb-8 p-4 border-4 border-status-red bg-status-red/10">
            <p className="font-pixel text-sm text-status-red">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-slide-up">
          <Card 
            className="p-6 cursor-pointer"
            onClick={() => navigate("/deck/new")}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 border-4 border-foreground bg-primary flex items-center justify-center shadow-[2px_2px_0px_hsl(var(--foreground))]">
                <Plus className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-pixel text-sm">CREATE DECK</h3>
            </div>
            <p className="font-retro text-lg text-muted-foreground">Start a new flashcard collection</p>
          </Card>

          <Card 
            className="p-6 cursor-pointer"
            onClick={() => navigate("/upload")}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 border-4 border-foreground bg-status-yellow flex items-center justify-center shadow-[2px_2px_0px_hsl(var(--foreground))]">
                <Upload className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="font-pixel text-sm">AI UPLOAD</h3>
            </div>
            <p className="font-retro text-lg text-muted-foreground">Generate cards from documents</p>
          </Card>

          <Card onClick={() => navigate("/study-all")} className="p-6 cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 border-4 border-foreground bg-status-green flex items-center justify-center shadow-[2px_2px_0px_hsl(var(--foreground))]">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-pixel text-sm">STUDY ALL</h3>
            </div>
            <p className="font-retro text-lg text-muted-foreground">Review all your flashcards</p>
          </Card>
        </div>

        <h2 className="font-pixel text-xl mb-4">YOUR DECKS</h2>

        {decks.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4" />
            <p className="font-pixel">NO DECKS YET</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map((deck) => (
              <Card
                key={deck._id}
                onClick={() => navigate(`/deck/${deck._id}`)}
                className="p-6 cursor-pointer"
              >
                <h3 className="font-pixel uppercase text-sm">{deck.title}</h3>
                <p className="font-retro text-xl text-muted-foreground">{deck.description}</p>

                <div className="mt-4 flex justify-between items-center">
                  <span className="text-md sm:text-lg text-muted-foreground">Cards</span>
                  <span className="font-pixel text-xs sm:text-[10px] text-muted-foreground">{deck.cardCount}</span>
                </div>

                {deck.cardCount > 0 && (
                  <div className="mt-2 flex gap-2">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-status-red border border-foreground" />
                      <span className="text-xs">{deck.progress.red}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-status-yellow border border-foreground" />
                      <span className="text-xs">{deck.progress.yellow}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-status-green border border-foreground" />
                      <span className="text-xs">{deck.progress.green}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-1 mt-4 border-t-2 pt-2">
                  <PixelCoin className="w-4 h-4"/> LVL {deck.level}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;