import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AICreateFlashcardCommand, FlashcardGroupDTO } from "@/types";

interface AIGenerationFormProps {
  group: FlashcardGroupDTO;
  onSuccess: () => void;
}

export default function AIGenerationForm({ group, onSuccess }: AIGenerationFormProps) {
  const [prompt, setPrompt] = useState(group.last_used_prompt || "");
  const [cardsCount, setCardsCount] = useState(group.last_used_cards_count || 10);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGeneratedPrompt, setLastGeneratedPrompt] = useState<string | null>(null);

  const validateInput = () => {
    if (!prompt.trim()) {
      setError("Prompt is required");
      return false;
    }
    if (prompt.length < 50) {
      setError("Prompt must be at least 50 characters long");
      return false;
    }
    if (prompt.length > 5000) {
      setError("Prompt must not exceed 5000 characters");
      return false;
    }
    if (cardsCount < 1) {
      setError("Cards count must be at least 1");
      return false;
    }
    if (cardsCount > 50) {
      setError("Cards count must not exceed 50");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInput()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const command: AICreateFlashcardCommand = {
        group_id: group.id,
        prompt: prompt.trim(),
        cards_count: cardsCount,
        user_id: group.user_id, // Required for development
      };

      const response = await fetch("/api/flashcards/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        throw new Error("Failed to generate flashcards");
      }

      setLastGeneratedPrompt(prompt.trim());
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while generating flashcards");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContinueIteration = () => {
    if (!lastGeneratedPrompt) return;

    setPrompt(
      `Based on the previous prompt "${lastGeneratedPrompt}", please generate more flashcards with these improvements: `
    );
  };

  const remainingChars = 5000 - prompt.length;
  const isValidLength = prompt.length >= 50 && prompt.length <= 5000;

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Flashcard Generation</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="prompt">
                Prompt <span className="text-destructive">*</span>
              </Label>
              <span
                className={`text-sm ${isValidLength ? "text-muted-foreground" : "text-destructive"}`}
                aria-live="polite"
              >
                {remainingChars < 0 ? "Too long" : `${remainingChars} characters remaining`}
              </span>
            </div>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                setError(null);
              }}
              placeholder="Enter your prompt for AI flashcard generation..."
              className="min-h-[100px]"
              disabled={isGenerating}
              aria-describedby={error ? "ai-error" : "prompt-hint"}
              aria-invalid={!!error}
            />
            <p id="prompt-hint" className="text-sm text-muted-foreground">
              Minimum 50 characters. Describe the topic and type of flashcards you want to generate.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cards-count">
              Number of Cards <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cards-count"
              type="number"
              min={1}
              max={50}
              value={cardsCount}
              onChange={(e) => {
                setCardsCount(parseInt(e.target.value, 10));
                setError(null);
              }}
              className="w-32"
              disabled={isGenerating}
            />
            <p className="text-sm text-muted-foreground">Maximum 50 cards per generation.</p>
          </div>

          {error && (
            <p id="ai-error" className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Button type="submit" disabled={isGenerating} aria-busy={isGenerating} className="w-full sm:w-auto">
              {isGenerating ? "Generating..." : "Generate Flashcards"}
            </Button>
            {lastGeneratedPrompt && (
              <Button type="button" variant="secondary" onClick={handleContinueIteration} disabled={isGenerating}>
                Continue to iterate?
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
