/// <reference types="astro/client" />

import type { ExtendedSupabaseClient } from "./db/supabase.client";

declare global {
  namespace App {
    interface Locals {
      supabase: ExtendedSupabaseClient;
      user?: {
        id: string;
        email: string;
      } | null;
    }
  }
}

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly OPENROUTER_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
