import { useState, useCallback, useEffect } from "react";
import type { FlashcardGroupDTO, UpdateFlashcardGroupCommand } from "@/types";

interface UseGroupDetailsState {
  group: FlashcardGroupDTO | null;
  isLoading: boolean;
  error: string | null;
}

export function useGroupDetails(groupId: string) {
  const [state, setState] = useState<UseGroupDetailsState>({
    group: null,
    isLoading: true,
    error: null,
  });

  const fetchGroup = useCallback(async () => {
    if (!groupId) return;

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const response = await fetch(`/api/groups/${groupId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch group details");
      }

      const data: FlashcardGroupDTO = await response.json();
      setState({ group: data, isLoading: false, error: null });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "An error occurred while fetching group details",
      }));
    }
  }, [groupId]);

  const updateGroup = useCallback(
    async (command: UpdateFlashcardGroupCommand): Promise<boolean> => {
      if (!groupId) return false;

      try {
        setState((prev) => ({ ...prev, error: null }));
        const response = await fetch(`/api/groups/${groupId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(command),
        });

        if (!response.ok) {
          throw new Error("Failed to update group");
        }

        const data: FlashcardGroupDTO = await response.json();
        setState((prev) => ({ ...prev, group: data }));
        return true;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : "An error occurred while updating group",
        }));
        return false;
      }
    },
    [groupId]
  );

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  return {
    ...state,
    fetchGroup,
    updateGroup,
  };
}
