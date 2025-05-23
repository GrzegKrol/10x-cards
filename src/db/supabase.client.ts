import type { AstroCookies } from "astro";
import { createClient, type SupabaseClient as BaseSupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import type { Database } from "./database.types";
import { ERROR_MESSAGES } from "@/lib/constants";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export const cookieOptions: CookieOptions = {
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "lax",
};

function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  return cookieHeader.split(";").map((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    return { name, value: rest.join("=") };
  });
}

export type ExtendedSupabaseClient = BaseSupabaseClient<Database> & {
  getUserIdFromSession(): Promise<string>;
};

// Define the function once here
const createGetUserIdFromSession = (client: BaseSupabaseClient<Database>) => async () => {
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) {
    throw new Error(ERROR_MESSAGES.UNAUTHORIZED_ACCESS);
  }
  return user.id;
};

export const createSupabaseServerInstance = (context: {
  headers: Headers;
  cookies: AstroCookies;
}): ExtendedSupabaseClient => {
  const baseClient = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookieOptions,
    cookies: {
      getAll() {
        return parseCookieHeader(context.headers.get("Cookie") ?? "");
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => context.cookies.set(name, value, options));
      },
    },
  });

  // Use the factory function to create getUserIdFromSession
  return Object.assign(baseClient, { getUserIdFromSession: createGetUserIdFromSession(baseClient) });
};

const baseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Use the same factory function for the client instance
export const supabaseClient: ExtendedSupabaseClient = Object.assign(baseClient, {
  getUserIdFromSession: createGetUserIdFromSession(baseClient),
});

export type SupabaseClient = ExtendedSupabaseClient;
