import { useState } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import type { CreateFlashcardCommand } from "@/types";

interface FlashcardModalProps {
  groupId: string;
  onSuccess: () => void;
}

export default function FlashcardModal({ groupId, onSuccess }: FlashcardModalProps) {
  const [open, setOpen] = useState(false);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
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
    if (!validateInput()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const command: CreateFlashcardCommand = {
        front: front.trim(),
        back: back.trim(),
        group_id: groupId,
      };

      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        throw new Error("Failed to create flashcard");
      }

      setOpen(false);
      setFront("");
      setBack("");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while creating flashcard");
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
    setFront("");
    setBack("");
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto" aria-label="Add new flashcard">
          Add Flashcard
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-md"
        onKeyDown={handleKeyDown}
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle id="dialog-title">Create New Flashcard</DialogTitle>
            <DialogDescription id="dialog-description">
              Add a new flashcard to your group. Enter the front and back text below.
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

            {error && (
              <p id="card-error" className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Flashcard"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
