import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import type { FlashcardDTO, UpdateFlashcardCommand } from "@/types";

interface FlashcardEditModalProps {
  flashcard: FlashcardDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function FlashcardEditModal({ flashcard, open, onOpenChange, onSuccess }: FlashcardEditModalProps) {
  const [front, setFront] = useState(flashcard?.front ?? "");
  const [back, setBack] = useState(flashcard?.back ?? "");
  const [isApproved, setIsApproved] = useState(flashcard?.is_approved ?? false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateInput = () => {
    if (!front.trim()) {
      setError("Front text is required");
      return false;
    }
    if (!back.trim()) {
      setError("Back text is required");
      return false;
    }
    if (front.length > 100) {
      setError("Front text must not exceed 100 characters");
      return false;
    }
    if (back.length > 100) {
      setError("Back text must not exceed 100 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flashcard || !validateInput()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const command: UpdateFlashcardCommand = {
        front: front.trim(),
        back: back.trim(),
        is_approved: isApproved,
      };

      const response = await fetch(`/api/flashcards/${flashcard.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        throw new Error("Failed to update flashcard");
      }

      onOpenChange(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while updating flashcard");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when flashcard changes
  useEffect(() => {
    if (flashcard) {
      setFront(flashcard.front);
      setBack(flashcard.back);
      setIsApproved(flashcard.is_approved ?? false);
      setError(null);
    }
  }, [flashcard]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-labelledby="dialog-title" aria-describedby="dialog-description">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle id="dialog-title">Edit Flashcard</DialogTitle>
            <DialogDescription id="dialog-description">
              Edit the front and back text of your flashcard below.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="front-text">
                Front Text <span className="text-destructive">*</span>
              </Label>
              <Input
                id="front-text"
                value={front}
                onChange={(e) => {
                  setFront(e.target.value);
                  setError(null);
                }}
                placeholder="Enter front text"
                maxLength={100}
                disabled={isSubmitting}
                aria-describedby={error ? "card-error" : undefined}
                aria-invalid={!!error}
                aria-required="true"
              />
              <p className="text-sm text-muted-foreground">{100 - front.length} characters remaining</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="back-text">
                Back Text <span className="text-destructive">*</span>
              </Label>
              <Input
                id="back-text"
                value={back}
                onChange={(e) => {
                  setBack(e.target.value);
                  setError(null);
                }}
                placeholder="Enter back text"
                maxLength={100}
                disabled={isSubmitting}
                aria-describedby={error ? "card-error" : undefined}
                aria-invalid={!!error}
                aria-required="true"
              />
              <p className="text-sm text-muted-foreground">{100 - back.length} characters remaining</p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="approved" checked={isApproved} onCheckedChange={setIsApproved} disabled={isSubmitting} />
              <Label htmlFor="approved">Approved</Label>
            </div>

            {error && (
              <p id="card-error" className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
