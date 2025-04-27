import { http, HttpResponse } from "msw";

export const handlers = [
  // Add API route handlers here
  http.get("/api/groups", () => {
    return HttpResponse.json([]);
  }),

  http.get("/api/groups/:groupId", ({ params }) => {
    return HttpResponse.json({
      id: params.groupId,
      name: "Test Group",
      description: "Test Description",
    });
  }),

  http.get("/api/groups/:groupId/flashcards", () => {
    return HttpResponse.json([]);
  }),
];
