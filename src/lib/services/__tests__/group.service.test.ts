import { describe, expect, it, vi, beforeEach } from "vitest";
import { GroupService } from "../group.service";
import { ERROR_MESSAGES } from "@/lib/constants";
import type { SupabaseClient } from "@/db/supabase.client";
import { AuthError } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import type { PostgrestSingleResponse } from "@supabase/postgrest-js";

describe("GroupService", () => {
  let service: GroupService;
  let mockSupabase: SupabaseClient;

  const mockUser: User = {
    id: "test-user-id",
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    phone: "",
    confirmation_sent_at: undefined,
    confirmed_at: undefined,
    last_sign_in_at: undefined,
    email_confirmed_at: undefined,
    recovery_sent_at: undefined,
    email_change_sent_at: undefined,
    new_email: undefined,
    invited_at: undefined,
    action_link: undefined,
    email: "test@example.com",
    role: undefined,
    factors: undefined,
    identities: undefined,
  };

  const mockSession = {
    user: mockUser,
    access_token: "mock-access-token",
    refresh_token: "mock-refresh-token",
    expires_in: 3600,
    token_type: "bearer",
  };

  beforeEach(() => {
    mockSupabase = {
      auth: {
        getSession: vi.fn(),
      },
      from: vi.fn(),
    } as unknown as SupabaseClient;

    service = new GroupService(mockSupabase);
  });

  describe("getGroups", () => {
    it("should fetch groups with pagination", async () => {
      const mockGroups = [{ id: "1", name: "Test Group" }];
      const query = { page: 1, limit: 10, sort: "updated_date" as const, order: "desc" as const };

      vi.spyOn(mockSupabase.auth, "getSession").mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const rangeMock = vi.fn().mockResolvedValue({
        data: mockGroups,
        count: 1,
        error: null,
      });

      const orderMock = vi.fn().mockReturnValue({ range: rangeMock });
      const eqMock = vi.fn().mockReturnValue({ order: orderMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });

      vi.spyOn(mockSupabase, "from").mockReturnValue({
        select: selectMock,
      } as unknown as ReturnType<SupabaseClient["from"]>);

      const result = await service.getGroups(query);

      expect(result).toEqual({
        data: mockGroups,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
        },
      });
    });

    it("should throw error when session is invalid", async () => {
      // Using the actual AuthError class instead of a plain object
      const authError = new AuthError("Invalid session", 401, "invalid_session");

      vi.spyOn(mockSupabase.auth, "getSession").mockResolvedValue({
        data: { session: null },
        error: authError,
      });

      await expect(
        service.getGroups({
          page: 1,
          limit: 10,
          sort: "updated_date",
          order: "desc",
        })
      ).rejects.toThrow(ERROR_MESSAGES.UNAUTHORIZED_ACCESS);
    });
  });

  describe("createGroup", () => {
    it("should create a new group successfully", async () => {
      const mockGroup = { id: "1", name: "New Group" };

      vi.spyOn(mockSupabase.auth, "getSession").mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const singleMock = vi.fn().mockResolvedValue({
        data: mockGroup,
        error: null,
      } as PostgrestSingleResponse<typeof mockGroup>);

      const selectMock = vi.fn().mockReturnValue({ single: singleMock });

      vi.spyOn(mockSupabase, "from").mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: selectMock,
        }),
      } as unknown as ReturnType<SupabaseClient["from"]>);

      const result = await service.createGroup({ name: "New Group" });

      expect(result).toEqual(mockGroup);
    });
  });

  describe("updateGroup", () => {
    it("should update group successfully", async () => {
      const mockGroup = { id: "1", name: "Updated Group" };

      vi.spyOn(mockSupabase.auth, "getSession").mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const singleMock = vi.fn().mockResolvedValue({
        data: mockGroup,
        error: null,
      } as PostgrestSingleResponse<typeof mockGroup>);

      const selectMock = vi.fn().mockReturnValue({ single: singleMock });
      const eq2Mock = vi.fn().mockReturnValue({ select: selectMock });
      const eqMock = vi.fn().mockReturnValue({ eq: eq2Mock });

      vi.spyOn(mockSupabase, "from").mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: eqMock,
        }),
      } as unknown as ReturnType<SupabaseClient["from"]>);

      const result = await service.updateGroup("1", { name: "Updated Group" });

      expect(result).toEqual(mockGroup);
    });

    it("should throw error when group not found", async () => {
      vi.spyOn(mockSupabase.auth, "getSession").mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const singleMock = vi.fn().mockResolvedValue({
        data: null,
        error: new Error(ERROR_MESSAGES.GROUP_NOT_FOUND),
      });

      const selectMock = vi.fn().mockReturnValue({ single: singleMock });
      const eq2Mock = vi.fn().mockReturnValue({ select: selectMock });
      const eqMock = vi.fn().mockReturnValue({ eq: eq2Mock });

      vi.spyOn(mockSupabase, "from").mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: eqMock,
        }),
      } as unknown as ReturnType<SupabaseClient["from"]>);

      await expect(service.updateGroup("1", { name: "Updated Group" })).rejects.toThrow(ERROR_MESSAGES.GROUP_NOT_FOUND);
    });
  });
});
