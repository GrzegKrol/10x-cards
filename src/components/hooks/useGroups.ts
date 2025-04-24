import { useState, useCallback } from "react";
import type { GroupsListDTO, CreateFlashcardGroupCommand, FlashcardGroupDTO } from "@/types";

export function useGroups() {
  const [groups, setGroups] = useState<FlashcardGroupDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/groups");

      if (!response.ok) {
        throw new Error("Failed to fetch groups");
      }

      const data: GroupsListDTO = await response.json();
      setGroups(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while fetching groups");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createGroup = useCallback(
    async (command: CreateFlashcardGroupCommand) => {
      try {
        setError(null);
        const response = await fetch("/api/groups", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(command),
        });

        if (!response.ok) {
          throw new Error("Failed to create group");
        }

        await fetchGroups();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred while creating group");
        return false;
      }
    },
    [fetchGroups]
  );

  return {
    groups,
    isLoading,
    error,
    fetchGroups,
    createGroup,
  };
}
