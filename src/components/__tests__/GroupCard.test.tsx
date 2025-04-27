import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import GroupCard from "../groups/GroupCard";
import type { FlashcardGroupDTO } from "@/types";

describe("GroupCard", () => {
  const mockGroup: FlashcardGroupDTO = {
    id: "1",
    name: "Test Group",
    user_id: "test-user",
    creation_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
    last_used_prompt: null,
    last_used_cards_count: null,
  };

  it("renders group information", () => {
    render(<GroupCard group={mockGroup} />);

    expect(screen.getByText(mockGroup.name)).toBeInTheDocument();
  });

  it("has correct link to group details", () => {
    render(<GroupCard group={mockGroup} />);

    const card = screen.getByRole("link");
    expect(card).toHaveAttribute("aria-label", expect.stringContaining(mockGroup.name));
  });
});
