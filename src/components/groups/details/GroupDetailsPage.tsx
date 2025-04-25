import { useRef } from "react";
import { useGroupDetails } from "@/components/hooks/useGroupDetails";
import GroupInfoSection from "./GroupInfoSection";
import AIFlashcardModal from "./AIFlashcardModal";
import FlashcardModal from "./FlashcardModal";
import FlashcardsList, { type FlashcardsListRef } from "./FlashcardsList";

interface GroupDetailsPageProps {
  groupId: string;
}

export default function GroupDetailsPage({ groupId }: GroupDetailsPageProps) {
  const { group, isLoading, error, updateGroup } = useGroupDetails(groupId);
  const flashcardsListRef = useRef<FlashcardsListRef>(null);

  const handleFlashcardsUpdate = () => {
    // Refresh the flashcards list from the first page
    flashcardsListRef.current?.fetchFlashcards(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8" role="status" aria-label="Loading group details">
        <div
          className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"
          aria-hidden="true"
        />
        <span className="sr-only">Loading group details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center text-destructive" role="alert" aria-live="polite">
        {error}
      </div>
    );
  }

  if (!group) {
    return (
      <div className="py-8 text-center text-destructive" role="alert" aria-live="polite">
        Group not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <GroupInfoSection group={group} onUpdate={updateGroup} />

      <div className="flex justify-end space-x-4">
        <AIFlashcardModal
          groupId={groupId}
          onSuccess={handleFlashcardsUpdate}
          lastUsedPrompt={group.last_used_prompt}
          lastUsedCardsCount={group.last_used_cards_count}
        />
        <FlashcardModal groupId={groupId} onSuccess={handleFlashcardsUpdate} />
      </div>

      <FlashcardsList ref={flashcardsListRef} groupId={groupId} />
    </div>
  );
}
