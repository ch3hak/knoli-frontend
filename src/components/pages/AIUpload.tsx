import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, FileText, Loader2, BookOpen, Plus, X, Check } from "lucide-react";
import { Button } from "../ui/Button";

interface Deck {
  _id: string;
  title: string;
  description: string;
}

const AIUpload = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [isSubmittingDeck, setIsSubmittingDeck] = useState(false);

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/deck/getAll", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch decks");
      }

      const data = await response.json();
      setDecks(data.data || []);
      
      if (data.data && data.data.length > 0) {
        setSelectedDeckId(data.data[0]._id);
      }
    } catch (err) {
      console.error("Error fetching decks:", err);
      setError("Failed to load decks");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDeck = async () => {
    if (!newTitle.trim()) return;
    setIsSubmittingDeck(true);
    setError(null);
    try {
      const res = await fetch("/api/deck/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: newTitle, description: "Created via AI Upload" })
      });
      const result = await res.json();
      if (res.ok) {
        setDecks([...decks, result.data]);
        setSelectedDeckId(result.data._id);
        setIsCreating(false);
        setNewTitle("");
      } else {
        setError(result.message || "Failed to create deck");
      }
    } catch (e) {
      setError("Failed to create deck");
    } finally {
      setIsSubmittingDeck(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['.txt', '.pdf', '.doc', '.docx'];
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!allowedTypes.includes(fileExt)) {
        setError("Please upload a TXT, PDF, DOC, or DOCX file");
        return;
      }
      
      if (file.size > 30 * 1024 * 1024) {
        setError("File size must be less than 30MB");
        return;
      }
      
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedDeckId) {
      setError("Please select a file and a deck");
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    
    try {
      const formData = new FormData();
      formData.append('syllabusFile', selectedFile);
      formData.append('deckId', selectedDeckId);

      const response = await fetch('/api/ai/generate-flashcards', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to generate flashcards');
      }

      setSuccess(`Successfully generated ${result.flashcardsCount} flashcards!`);
      
      setTimeout(() => {
        navigate(`/deck/${selectedDeckId}`);
      }, 2000);
      
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to generate flashcards. Please try again.');
    } finally {
      setIsProcessing(false);
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

      <div className="max-w-2xl mx-auto">
        <div className="mb-8 mt-8 animate-fade-in">
        <Button 
            variant="ghost"
            onClick={() => navigate("/dashboard")} 
            className="mb-4 sm:mb-7 hidden sm:flex"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            BACK TO DASHBOARD
        </Button>
          
          <h1 className="font-pixel text-2xl sm:text-3xl mb-2">AI DOCUMENT UPLOAD</h1>
          <p className="font-retro text-xl text-muted-foreground">
            Generate flashcards from your documents using AI
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 border-4 border-status-red bg-status-red/10 animate-slide-up">
            <p className="font-pixel text-xs text-status-red">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 border-4 border-status-green bg-status-green/10 animate-slide-up">
            <p className="font-pixel text-xs text-status-green">{success}</p>
          </div>
        )}

        <div className="bg-card border-4 border-foreground shadow-[4px_4px_0px_var(--color-foreground)] animate-slide-up">
          <div className="p-6 border-b-4 border-foreground">
            <h2 className="font-pixel text-sm mb-1">UPLOAD DOCUMENT</h2>
            <p className="font-retro text-lg text-muted-foreground">
              Upload a PDF, Word document, or text file and let AI create flashcards for you
            </p>
          </div>
          
          <div className="p-6 space-y-6">
            {decks.length === 0 && !isCreating ? (
              <div className="text-center p-8 border-4 border-dashed border-muted">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="font-pixel text-xs mb-4">NO DECKS FOUND</p>
                <button
                  onClick={() => setIsCreating(true)}
                  className="px-4 py-2 bg-primary text-primary-foreground border-4 border-foreground shadow-[4px_4px_0px_var(--color-foreground)] font-pixel text-xs hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_var(--color-foreground)] transition-all"
                >
                  CREATE DECK
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="font-pixel text-xs block">SELECT DECK</label>
                <div className="flex gap-2">
                  {!isCreating ? (
                    <>
                      <select
                        value={selectedDeckId}
                        onChange={(e) => setSelectedDeckId(e.target.value)}
                        className="flex-1 p-3 border-4 border-foreground bg-input font-retro text-lg focus:outline-none focus:ring-2 focus:ring-ring"
                        disabled={isProcessing}
                      >
                        {decks.map((deck) => (
                          <option key={deck._id} value={deck._id}>
                            {deck.title}
                          </option>
                        ))}
                      </select>
                      <button 
                        onClick={() => setIsCreating(true)}
                        className="p-3 border-4 border-foreground bg-primary shadow-[2px_2px_0px_#000] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[4px_4px_0px_#000] transition-all"
                        disabled={isProcessing}
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <input 
                        autoFocus
                        className="flex-1 p-3 border-4 border-foreground bg-input font-retro text-lg focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="NEW DECK NAME..."
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateDeck()}
                        disabled={isSubmittingDeck}
                      />
                      <button 
                        onClick={handleCreateDeck} 
                        className="p-3 border-4 border-foreground bg-primary shadow-[2px_2px_0px_#000] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[4px_4px_0px_#000] transition-all"
                        disabled={isSubmittingDeck || !newTitle.trim()}
                      >
                        {isSubmittingDeck ? <Loader2 className="w-5 h-5 animate-spin"/> : <Check className="w-5 h-5" />}
                      </button>
                      <button 
                        onClick={() => {
                          setIsCreating(false);
                          setNewTitle("");
                        }} 
                        className="p-3 border-4 border-foreground bg-status-red shadow-[2px_2px_0px_#000] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[4px_4px_0px_#000] transition-all"
                        disabled={isSubmittingDeck}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="border-4 border-dashed border-foreground p-12 text-center transition-colors hover:border-primary">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
                disabled={isProcessing}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                {selectedFile ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 border-4 border-foreground bg-primary flex items-center justify-center mx-auto shadow-[2px_2px_0px_var(--color-foreground)]">
                      <FileText className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-pixel text-xs mb-1">{selectedFile.name}</p>
                      <p className="font-retro text-lg text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedFile(null);
                      }}
                      className="px-4 py-2 border-4 border-foreground bg-card font-pixel text-xs shadow-[4px_4px_0px_var(--color-foreground)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_var(--color-foreground)] transition-all"
                      disabled={isProcessing}
                    >
                      CHOOSE DIFFERENT FILE
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 border-4 border-foreground bg-accent flex items-center justify-center mx-auto shadow-[2px_2px_0px_var(--color-foreground)]">
                      <Upload className="w-8 h-8 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="font-pixel text-xs mb-2">CLICK TO UPLOAD DOCUMENT</p>
                      <p className="font-retro text-lg text-muted-foreground">
                        PDF, DOC, DOCX, or TXT (max 30MB)
                      </p>
                    </div>
                  </div>
                )}
              </label>
            </div>

            <div className="flex gap-3">
              <button
                className="flex-1 px-4 py-3 bg-primary text-primary-foreground border-4 border-foreground shadow-[4px_4px_0px_var(--color-foreground)] font-pixel text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_var(--color-foreground)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                disabled={!selectedFile || !selectedDeckId || isProcessing}
                onClick={handleUpload}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    PROCESSING...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4" />
                    GENERATE FLASHCARDS
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                disabled={isProcessing}
                className="px-4 py-3 border-4 border-foreground bg-card font-pixel text-xs shadow-[4px_4px_0px_var(--color-foreground)] disabled:opacity-50 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_var(--color-foreground)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
              >
                CANCEL
              </button>
            </div>

            <div className="bg-muted/50 border-4 border-foreground p-4">
              <p className="font-pixel text-xs mb-3">HOW IT WORKS:</p>
              <ol className="list-decimal list-inside space-y-2 font-retro text-lg text-muted-foreground">
                <li>Upload your study material or notes</li>
                <li>AI analyzes the content and extracts key concepts</li>
                <li>Flashcards are automatically generated (5-50 cards based on content)</li>
                <li>Review and edit the generated cards in your deck</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
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

export default AIUpload;