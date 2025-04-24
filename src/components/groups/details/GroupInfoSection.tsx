import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FlashcardGroupDTO, UpdateFlashcardGroupCommand } from "@/types";

interface GroupInfoSectionProps {
  group: FlashcardGroupDTO;
  onUpdate: (command: UpdateFlashcardGroupCommand) => Promise<boolean>;
}

export default function GroupInfoSection({ group, onUpdate }: GroupInfoSectionProps) {
  const [name, setName] = useState(group.name);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Group name is required");
      return;
    }

    if (name.trim().length > 100) {
      setError("Group name must not exceed 100 characters");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const success = await onUpdate({
        name: name.trim(),
        last_used_prompt: group.last_used_prompt || undefined,
        last_used_cards_count: group.last_used_cards_count || undefined,
      });

      if (success) {
        setIsEditing(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update group name");
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    } else if (e.key === "Escape") {
      setName(group.name);
      setIsEditing(false);
      setError(null);
    }
  };

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(group.updated_date));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Group Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="group-name">Name</Label>
          {isEditing ? (
            <div className="space-y-2">
              <Input
                id="group-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                onKeyDown={handleKeyDown}
                onBlur={() => {
                  if (name.trim() === group.name) {
                    setIsEditing(false);
                    setError(null);
                  }
                }}
                maxLength={100}
                disabled={isSaving}
                aria-invalid={!!error}
                aria-describedby={error ? "name-error" : undefined}
              />
              {error && (
                <p id="name-error" className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
              <div className="flex space-x-2">
                <Button onClick={handleSubmit} disabled={isSaving || name.trim() === group.name} aria-busy={isSaving}>
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setName(group.name);
                    setIsEditing(false);
                    setError(null);
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="text-lg font-medium hover:text-primary w-full text-left transition-colors p-2 -m-2 rounded-md hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring"
              onClick={() => setIsEditing(true)}
              aria-label="Click to edit group name"
            >
              {group.name}
            </button>
          )}
        </div>

        <div className="space-y-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">Last updated: {formattedDate}</p>
          {group.last_used_prompt && (
            <div className="space-y-2">
              <Label>Last Used Prompt</Label>
              <p className="text-sm text-muted-foreground line-clamp-3">{group.last_used_prompt}</p>
              <p className="text-sm text-muted-foreground">Generated {group.last_used_cards_count || 0} cards</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
