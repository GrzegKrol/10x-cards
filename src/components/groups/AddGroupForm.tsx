import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CreateFlashcardGroupCommand } from "@/types";

interface AddGroupFormProps {
  onSubmit: (command: CreateFlashcardGroupCommand) => Promise<boolean>;
}

export default function AddGroupForm({ onSubmit }: AddGroupFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Group name is required");
      return;
    }

    if (name.length > 100) {
      setError("Group name must be less than 100 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onSubmit({ name: name.trim() });
      if (success) {
        setOpen(false);
        setName("");
      }
    } catch {
      setError("Failed to create group. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto" aria-label="Add new flashcard group">
          Add Group
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-md"
        onKeyDown={handleKeyDown}
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <DialogHeader>
          <DialogTitle id="dialog-title">Create New Group</DialogTitle>
          <DialogDescription id="dialog-description">
            Add a new flashcard group. Enter a name for your group below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group-name">Group Name</Label>
            <Input
              id="group-name"
              name="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="Enter group name"
              aria-describedby={error ? "name-error" : undefined}
              aria-invalid={error ? "true" : undefined}
              aria-required="true"
              maxLength={100}
              className="w-full"
            />
            {error && (
              <p id="name-error" className="text-sm text-destructive" role="alert" aria-live="polite">
                {error}
              </p>
            )}
          </div>
          <DialogFooter className="sm:space-x-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto" aria-busy={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
