import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";

export const POST: APIRoute = async ({ cookies, request }) => {
  try {
    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
    const { error } = await supabase.auth.signOut();

    if (error) {
      return new Response(JSON.stringify({ error: "Failed to logout" }), { status: 400 });
    }

    return new Response(null, { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: "Failed to logout" }), { status: 500 });
  }
};
