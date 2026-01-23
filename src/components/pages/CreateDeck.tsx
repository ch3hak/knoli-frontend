import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import Input from "../ui/Input";
import { TextArea } from "../ui/TextArea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card";
import Label from "../ui/Label";
import { ArrowLeft } from "lucide-react";
import { useToast } from "../../hooks/useToast";

const CreateDeck = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try { 
      const response = await fetch('/api/deck/new', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          isPublic,
          tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Deck created!",
          description: "Now add some flashcards to get started.",
        });
        navigate(`/deck/${data.data._id}`);
      } else {
        toast({
          title: "⚠️ Error",
          description: data.message || "Failed to create deck",
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
    <div className="mt-6 sm:-mt-1 min-h-screen p-6 scanlines">
        <div className="max-w-2xl mx-auto">
            <div className="mb-6 animate-fade-in">
                <Button 
                    variant="ghost" 
                    onClick={() => navigate("/dashboard")} 
                    className="hidden sm:flex mb-8"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    <p className="text-sm">Back to Dashboard</p>
                </Button>

                <div className="flex items-center gap-3 sm:block">
                    <Button 
                        variant="ghost" 
                        onClick={() => navigate("/dashboard")} 
                        className="sm:hidden p-1 mr-2 bg-primary text-primary-foreground"
                        >
                        <ArrowLeft className="w-6 h-4" />
                    </Button>
                <div className="flex-1">
                    <h1 className="text-[18px] sm:text-3xl font-bold">Create New Deck</h1>
                    <p className="text-muted-foreground text-sm sm:text-base">Start organizing your flashcards</p>
                </div>
            </div>
        </div>
        <Card className="border-2 shadow-(--shadow-card) animate-slide-up">
          <CardHeader>
            <CardTitle>Deck Details</CardTitle>
            <CardDescription>Give your deck a name and description</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., JavaScript Fundamentals"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <TextArea
                  id="description"
                  placeholder="What will you learn from this deck?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  disabled={isLoading}
                  className="bg-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  placeholder="e.g., programming, javascript, web-dev"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  disabled={isLoading}
                  className="w-full"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  disabled={isLoading}
                  className="w-4 h-4"
                />
                <Label htmlFor="isPublic" className="cursor-pointer">
                  Make this deck public
                </Label>
              </div>

              <div className="flex gap-3 pt-3 sm:pt-1">
                <Button type="submit" className="flex-1 bg-primary text-primary-foreground" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Deck"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateDeck;