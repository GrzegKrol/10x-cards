import type { AstroCookies } from "astro";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export const cookieOptions: CookieOptions = {
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "lax",
};

export const createSupabaseServerInstance = (context: { headers: Headers; cookies: AstroCookies }) => {
  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        const cookie = context.cookies.get(name);
        return cookie?.value;
      },
      set(name: string, value: string, options?: CookieOptions) {
        context.cookies.set(name, value, options);
      },
      remove(name: string, options?: CookieOptions) {
        context.cookies.delete(name, options);
      },
    },
  });

  return supabase;
};

// Client-side Supabase instance
export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type SupabaseClient = typeof supabaseClient;

export const DEFAULT_USER_ID = "b975a481-59da-46a6-8ee9-ceb37621cd54";
