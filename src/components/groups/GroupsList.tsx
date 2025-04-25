import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import GroupCard from "@/components/groups/GroupCard";
import AddGroupForm from "@/components/groups/AddGroupForm";
import { useGroups } from "@/components/hooks/useGroups";

export default function GroupsList() {
  const { groups, isLoading, error, fetchGroups, createGroup } = useGroups();

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8" role="status" aria-label="Loading groups">
        <div
          className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"
          aria-hidden="true"
        />
        <span className="sr-only">Loading groups...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center text-destructive" role="alert" aria-live="polite">
        <p>{error}</p>
        <Button onClick={() => fetchGroups()} variant="link" className="mt-4">
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <AddGroupForm onSubmit={createGroup} />
      </div>

      {groups.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground" role="status" aria-live="polite">
          <p>No groups found. Create your first group to get started!</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label="Flashcard groups">
          {groups.map((group) => (
            <div key={group.id} role="listitem">
              <GroupCard group={group} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
