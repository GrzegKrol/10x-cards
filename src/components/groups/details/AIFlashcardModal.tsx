import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Using a type that omits user_id since it's handled server-side
interface AIFlashcardRequest {
  prompt: string;
  cards_count: number;
  group_id: string;
}

interface AIFlashcardModalProps {
  groupId: string;
  onSuccess: () => void;
  lastUsedPrompt?: string | null;
  lastUsedCardsCount?: number | null;
}

export default function AIFlashcardModal({
  groupId,
  onSuccess,
  lastUsedPrompt,
  lastUsedCardsCount,
}: AIFlashcardModalProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState(lastUsedPrompt || "");
  const [cardsCount, setCardsCount] = useState(lastUsedCardsCount || 5);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateInput = () => {
    if (!prompt.trim()) {
      setError("Prompt is required");
      return false;
    }
    if (prompt.length < 50) {
      setError("Prompt must be at least 50 characters");
      return false;
    }
    if (prompt.length > 5000) {
      setError("Prompt must not exceed 5000 characters");
      return false;
    }
    if (cardsCount < 1) {
      setError("Number of cards must be at least 1");
      return false;
    }
    if (cardsCount > 50) {
      setError("Number of cards must not exceed 50");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInput()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const command: AIFlashcardRequest = {
        prompt: prompt.trim(),
        cards_count: cardsCount,
        group_id: groupId,
      };

      const response = await fetch("/api/flashcards/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        throw new Error("Failed to generate flashcards");
      }

      setOpen(false);
      setPrompt(lastUsedPrompt || "");
      setCardsCount(lastUsedCardsCount || 5);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while generating flashcards");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setPrompt(lastUsedPrompt || "");
    setCardsCount(lastUsedCardsCount || 5);
    setError(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          handleClose();
        }
      }}
    >
      <DialogTrigger asChild onClick={() => setOpen(true)}>
        <Button className="w-full sm:w-auto" aria-label="Generate flashcards with AI">
          AI Generate
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-lg"
        onKeyDown={handleKeyDown}
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle id="dialog-title">Generate Flashcards with AI</DialogTitle>
            <DialogDescription id="dialog-description">
              Enter a prompt to generate flashcards. The AI will create front and back text for each card.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">
                Prompt <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  setError(null);
                }}
                placeholder="Enter a detailed prompt to generate flashcards (min 50 characters)"
                rows={5}
                maxLength={5000}
                disabled={isSubmitting}
                aria-describedby={error ? "prompt-error" : undefined}
                aria-invalid={!!error}
                aria-required="true"
              />
              <p className="text-sm text-muted-foreground">{5000 - prompt.length} characters remaining (minimum 50)</p>
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
                  setCardsCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)));
                  setError(null);
                }}
                placeholder="Enter number of cards to generate"
                disabled={isSubmitting}
                aria-describedby={error ? "prompt-error" : undefined}
                aria-invalid={!!error}
                aria-required="true"
              />
              <p className="text-sm text-muted-foreground">Maximum 50 cards</p>
            </div>

            {error && (
              <p id="prompt-error" className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
              {isSubmitting ? "Generating..." : "Generate Flashcards"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
