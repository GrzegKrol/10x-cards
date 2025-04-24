import { Button } from "@/components/ui/button";
import { useGroupDetails } from "@/components/hooks/useGroupDetails";
import Header from "@/components/Header";
import GroupInfoSection from "@/components/groups/details/GroupInfoSection";
import FlashcardsList from "@/components/groups/details/FlashcardsList";
import FlashcardModal from "@/components/groups/details/FlashcardModal";
import AIFlashcardModal from "@/components/groups/details/AIFlashcardModal";
import ErrorBoundary from "@/components/ErrorBoundary";

interface GroupDetailsPageProps {
  groupId: string;
}

export default function GroupDetailsPage({ groupId }: GroupDetailsPageProps) {
  const { group, isLoading, error, fetchGroup, updateGroup } = useGroupDetails(groupId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]" role="status" aria-label="Loading group details">
        <div
          className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"
          aria-hidden="true"
        />
        <span className="sr-only">Loading group details...</span>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[200px] text-center"
        role="alert"
        aria-live="assertive"
      >
        <p className="text-destructive mb-4">{error || "Group not found"}</p>
        <Button onClick={() => fetchGroup()} variant="outline">
          Try again
        </Button>
      </div>
    );
  }

  const breadcrumbs = [{ label: "Home", href: "/" }, { label: "Groups", href: "/groups" }, { label: group.name }];

  return (
    <ErrorBoundary>
      <div className="space-y-8">
        <Header breadcrumbs={breadcrumbs} />

        <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-8">
            <ErrorBoundary>
              <GroupInfoSection group={group} onUpdate={updateGroup} />
            </ErrorBoundary>
            <div className="flex justify-end gap-4">
              <AIFlashcardModal
                groupId={group.id}
                onSuccess={fetchGroup}
                lastUsedPrompt={group.last_used_prompt}
                lastUsedCardsCount={group.last_used_cards_count}
              />
              <FlashcardModal groupId={group.id} onSuccess={fetchGroup} />
            </div>
            <ErrorBoundary>
              <FlashcardsList groupId={group.id} />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
