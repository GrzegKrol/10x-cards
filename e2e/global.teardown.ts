import { test as teardown } from "@playwright/test";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getValidatedEnvProperties, type EnvProperties } from "./types";

async function createSupabaseClient(env: EnvProperties): Promise<SupabaseClient> {
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

  return supabase;
}

teardown("delete test data", async () => {
  const env = getValidatedEnvProperties();
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
