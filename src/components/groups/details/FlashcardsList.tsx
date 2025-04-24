import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { FlashcardsListDTO, FlashcardDTO } from "@/types";

interface FlashcardsListProps {
  groupId: string;
}

export default function FlashcardsList({ groupId }: FlashcardsListProps) {
  const [flashcards, setFlashcards] = useState<FlashcardDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchFlashcards = useCallback(
    async (pageNumber = 1) => {
      try {
        setError(null);
        if (pageNumber === 1) setIsLoading(true);

        const searchParams = new URLSearchParams({
          group_id: groupId,
          page: pageNumber.toString(),
          limit: "20",
          sort: "updated_date",
          order: "desc",
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
          <Card key={flashcard.id} className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Front</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <p className="text-sm">{flashcard.front}</p>
            </CardContent>
            <CardHeader>
              <CardTitle className="text-base">Back</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <p className="text-sm">{flashcard.back}</p>
            </CardContent>
          </Card>
        ))}
      </div>
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
