import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Trash2 } from "lucide-react";
import type { FlashcardsListDTO, FlashcardDTO, UpdateFlashcardCommand } from "@/types";
import FlashcardEditModal from "./FlashcardEditModal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FlashcardsListProps {
  groupId: string;
}

export interface FlashcardsListRef {
  fetchFlashcards: (page?: number) => Promise<void>;
}

const FlashcardsList = forwardRef<FlashcardsListRef, FlashcardsListProps>(({ groupId }, ref) => {
  const [flashcards, setFlashcards] = useState<FlashcardDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedFlashcard, setSelectedFlashcard] = useState<FlashcardDTO | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updatingCardId, setUpdatingCardId] = useState<string | null>(null);
  const [isDeletionEnabled, setIsDeletionEnabled] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const fetchFlashcards = useCallback(
    async (pageNumber = 1) => {
      try {
        setError(null);
        if (pageNumber === 1) setIsLoading(true);

        const searchParams = new URLSearchParams({
          group_id: groupId,
          page: pageNumber.toString(),
          limit: "20",
        });

        const response = await fetch(`/api/flashcards?${searchParams}`);
        if (!response.ok) {
          throw new Error("Failed to fetch flashcards");
        }

        const data: FlashcardsListDTO = await response.json();
        setFlashcards((prev) => (pageNumber === 1 ? data.data : [...prev, ...data.data]));
        setHasMore(data.data.length > 0 && data.pagination.total > pageNumber * data.pagination.limit);
        setPage(pageNumber);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred while fetching flashcards");
      } finally {
        setIsLoading(false);
      }
    },
    [groupId]
  );

  useImperativeHandle(
    ref,
    () => ({
      fetchFlashcards,
    }),
    [fetchFlashcards]
  );

  useEffect(() => {
    fetchFlashcards();

    // Set up polling every 30 seconds
    const interval = setInterval(() => {
      fetchFlashcards(1); // Refresh from first page
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchFlashcards]);

  const handleCardClick = (flashcard: FlashcardDTO) => {
    setSelectedFlashcard(flashcard);
    setIsEditModalOpen(true);
  };

  const handleApprovalChange = async (flashcard: FlashcardDTO, approved: boolean) => {
    try {
      setUpdatingCardId(flashcard.id);
      const command: UpdateFlashcardCommand = {
        front: flashcard.front,
        back: flashcard.back,
        is_approved: approved,
      };

      const response = await fetch(`/api/flashcards/${flashcard.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        throw new Error("Failed to update flashcard");
      }

      const updatedCard: FlashcardDTO = await response.json();
      setFlashcards((cards) => cards.map((card) => (card.id === updatedCard.id ? updatedCard : card)));
    } catch {
      // Revert the change visually
      setFlashcards((cards) => [...cards]);
    } finally {
      setUpdatingCardId(null);
    }
  };

  const handleDeleteFlashcard = async (flashcard: FlashcardDTO, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      setUpdatingCardId(flashcard.id);
      const response = await fetch(`/api/flashcards/${flashcard.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete flashcard");
      }

      setFlashcards((cards) => cards.filter((card) => card.id !== flashcard.id));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to delete flashcard:", error);
      setError(error instanceof Error ? error.message : "Failed to delete flashcard");
    } finally {
      setUpdatingCardId(null);
    }
  };

  const handleDeleteAll = async () => {
    try {
      setIsDeletingAll(true);
      setError(null);
      const response = await fetch(`/api/groups/${groupId}/flashcards`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete all flashcards");
      }

      setFlashcards([]);
      setIsDeleteAllModalOpen(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to delete all flashcards:", error);
      setError(error instanceof Error ? error.message : "Failed to delete all flashcards");
    } finally {
      setIsDeletingAll(false);
    }
  };

  if (isLoading && flashcards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[200px]" role="status" aria-label="Loading flashcards">
        <div
          className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"
          aria-hidden="true"
        />
        <span className="sr-only">Loading flashcards...</span>
      </div>
    );
  }

  if (error && flashcards.length === 0) {
    return (
      <div className="text-center py-8 text-destructive" role="alert" aria-live="assertive">
        {error}
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground" role="status">
        No flashcards found. Generate some using AI or add them manually.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Flashcards</h2>
        <div className="flex items-center space-x-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="delete-mode"
                    checked={isDeletionEnabled}
                    onCheckedChange={setIsDeletionEnabled}
                    aria-label="Enable deletion mode"
                  />
                  <Label htmlFor="delete-mode">Enable Deletion</Label>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle to enable or disable quick deletion of flashcards</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleteAllModalOpen(true)}
                  aria-label="Delete all flashcards"
                >
                  Delete All
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete all flashcards in this group (requires confirmation)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-4 text-sm text-destructive bg-destructive/10 rounded-md" role="alert">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {flashcards.map((flashcard) => (
          <Card
            key={flashcard.id}
            className="h-full cursor-pointer hover:bg-accent/50 transition-colors relative py-2"
            onClick={(e) => {
              if ((e.target as HTMLElement).closest(".approval-switch, .delete-button")) {
                e.stopPropagation();
                return;
              }
              handleCardClick(flashcard);
            }}
            tabIndex={0}
            role="button"
            aria-label={`Edit flashcard: Front - ${flashcard.front}, Back - ${flashcard.back}`}
          >
            <CardHeader className="flex flex-row items-start justify-between space-x-2 py-1 px-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="delete-button h-8 w-8 rounded-full hover:bg-destructive/90 hover:text-destructive-foreground"
                      onClick={(e) => handleDeleteFlashcard(flashcard, e)}
                      disabled={!isDeletionEnabled || updatingCardId === flashcard.id}
                      aria-label="Delete flashcard"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isDeletionEnabled ? "Click to delete" : "Enable deletion mode to delete"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="flex items-center space-x-2">
                <span
                  className={`text-xs px-2 py-1 rounded-md ${
                    flashcard.source === "ai" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {flashcard.source === "ai" ? "AI" : "M"}
                </span>
                <div className="approval-switch">
                  <Switch
                    checked={flashcard.is_approved ?? false}
                    onCheckedChange={(checked) => handleApprovalChange(flashcard, checked)}
                    disabled={updatingCardId === flashcard.id}
                    className={flashcard.is_approved ? "bg-green-500" : ""}
                    aria-label={`Mark flashcard as ${flashcard.is_approved ? "unapproved" : "approved"}`}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-4">
                <div>
                  <p className="text-sm">
                    <span className="font-semibold">Front:</span> {flashcard.front}
                  </p>
                </div>
                <div className="border-t border-border" />
                <div>
                  <p className="text-sm">
                    <span className="font-semibold">Back:</span> {flashcard.back}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <FlashcardEditModal
        flashcard={selectedFlashcard}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSuccess={() => fetchFlashcards(1)}
      />

      <Dialog open={isDeleteAllModalOpen} onOpenChange={setIsDeleteAllModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete All Flashcards</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete all flashcards from this group? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteAllModalOpen(false)} disabled={isDeletingAll}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAll} disabled={isDeletingAll}>
              {isDeletingAll ? "Deleting..." : "Delete All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {hasMore && (
        <div className="text-center pt-4">
          <button
            onClick={() => fetchFlashcards(page + 1)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "Loading more..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
});

FlashcardsList.displayName = "FlashcardsList";
export default FlashcardsList;
