import { test as teardown } from "@playwright/test";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

interface EnvVariables {
  supabaseUrl: string;
  supabaseKey: string;
  userId: string;
  email: string;
  password: string;
}

function validateEnv(): EnvVariables {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  const userId = process.env.E2E_USERNAME_ID;
  const email = process.env.E2E_USERNAME;
  const password = process.env.E2E_PASSWORD;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("SUPABASE_URL and SUPABASE_KEY environment variables must be set");
  }

  if (!userId || !email || !password) {
    throw new Error("E2E_USERNAME_ID, E2E_USERNAME, and E2E_PASSWORD environment variables must be set");
  }

  return { supabaseUrl, supabaseKey, userId, email, password };
}

async function createSupabaseClient(env: EnvVariables): Promise<SupabaseClient> {
  const supabase = createClient(env.supabaseUrl, env.supabaseKey);

  console.log("Authenticating with Supabase...");
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: env.email,
    password: env.password,
  });

  if (authError) {
    console.error("Authentication error:", authError);
    throw new Error(`Failed to authenticate: ${authError.message}`);
  }

  console.log("Successfully authenticated with Supabase");
  return supabase;
}

teardown("delete test data", async () => {
  const env = validateEnv();
  const supabase = await createSupabaseClient(env);

  console.log(`Cleaning up data for user: ${env.userId}`);

  // Delete flashcards first due to foreign key constraints
  const { data: deletedFlashcards, error: flashcardsError } = await supabase
    .from("flashcard")
    .delete()
    .eq("user_id", env.userId)
    .select();

  if (flashcardsError) {
    console.error("Error deleting flashcards:", flashcardsError);
  } else {
    console.log("Flashcards deleted:", deletedFlashcards);
  }

  // Then delete flashcard groups
  const { data: deletedGroups, error: groupsError } = await supabase
    .from("flashcards_group")
    .delete()
    .eq("user_id", env.userId)
    .select();

  if (groupsError) {
    console.error("Error deleting groups:", groupsError);
  } else {
    console.log("Groups deleted:", deletedGroups);
  }

  console.log("Test data cleanup completed");
});
