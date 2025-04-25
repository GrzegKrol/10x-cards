import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Trash2 } from "lucide-react";
import type { FlashcardsListDTO, FlashcardDTO, UpdateFlashcardCommand } from "@/types";
import FlashcardEditModal from "./FlashcardEditModal";
import { Button } from "@/components/ui/button";

interface FlashcardsListProps {
  groupId: string;
}

export default function FlashcardsList({ groupId }: FlashcardsListProps) {
  const [flashcards, setFlashcards] = useState<FlashcardDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedFlashcard, setSelectedFlashcard] = useState<FlashcardDTO | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updatingCardId, setUpdatingCardId] = useState<string | null>(null);

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
    e.stopPropagation(); // Prevent opening edit modal

    if (!confirm("Are you sure you want to delete this flashcard?")) {
      return;
    }

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
      console.error("Failed to delete flashcard:", error);
      alert("Failed to delete flashcard. Please try again.");
    } finally {
      setUpdatingCardId(null);
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
      <h2 className="text-lg font-semibold">Flashcards</h2>
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
              <Button
                variant="ghost"
                size="icon"
                className="delete-button h-8 w-8 rounded-full hover:bg-destructive/90 hover:text-destructive-foreground"
                onClick={(e) => handleDeleteFlashcard(flashcard, e)}
                disabled={updatingCardId === flashcard.id}
                aria-label="Delete flashcard"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
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
}
