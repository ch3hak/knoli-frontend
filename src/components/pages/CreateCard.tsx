import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../ui/Button";
import { TextArea } from "../ui/TextArea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card";
import Label from "../ui/Label";
import { ArrowLeft } from "lucide-react";
import { useToast } from "../../hooks/useToast";
import Input from "../ui/Input";

const CreateCard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [tags, setTags] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/flashcard/new/${id}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          front,
          back,
          tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Card created!",
          description: "Your new flashcard has been added to the deck.",
        });
        navigate(`/deck/${id}`);
      } else {
        toast({
          title: "⚠️ Error",
          description: data.message || "Failed to create card",
        });
      }
    } catch (error) {
      toast({
        title: "⚠️ Error",
        description: "Failed to connect to server",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4 sm:-mt-1 min-h-screen p-6 scanlines">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 animate-fade-in">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/deck/${id}`)} 
            className="hidden sm:flex mb-8 sm:mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <p className="text-sm">BACK TO DECK</p>
          </Button>

          <div className="flex items-center gap-3 sm:block">
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/deck/${id}`)} 
              className="sm:hidden p-1 mr-2 bg-primary text-primary-foreground"
            >
              <ArrowLeft className="w-6 h-5" />
            </Button>

            <div className="flex-1">
              <h1 className="text-[18px] sm:text-3xl font-bold">
                Create New Card
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Add a flashcard to your deck
              </p>
            </div>
          </div>
        </div>

        <Card className="border-2 shadow-(--shadow-card) animate-slide-up">
          <CardHeader>
            <CardTitle>Flashcard Content</CardTitle>
            <CardDescription>Enter the question and answer for your flashcard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="front">Front (Question) *</Label>
                <TextArea
                  id="front"
                  placeholder="Enter your question or prompt..."
                  value={front}
                  onChange={(e) => setFront(e.target.value)}
                  rows={4}
                  required
                  disabled={isLoading}
                  className="bg-input h-2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="back">Back (Answer) *</Label>
                <TextArea
                  id="back"
                  placeholder="Enter the answer or explanation..."
                  value={back}
                  onChange={(e) => setBack(e.target.value)}
                  rows={4}
                  required
                  disabled={isLoading}
                  className="bg-input h-2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  type="text"
                  placeholder="e.g., important, chapter-1, review"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3 py-2 bg-input"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 bg-primary text-primary-foreground" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Card"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateCard;