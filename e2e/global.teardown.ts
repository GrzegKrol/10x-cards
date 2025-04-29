import { test as teardown } from "@playwright/test";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getValidatedEnvProperties, type EnvProperties } from "./types";
import { logInfo, logError } from "./utils/test-logger";

async function createSupabaseClient(env: EnvProperties): Promise<SupabaseClient> {
  const supabase = createClient(env.supabaseUrl, env.supabaseKey);

  const { error: authError } = await supabase.auth.signInWithPassword({
    email: env.email,
    password: env.password,
  });

  if (authError) {
    logError(`Authentication error: ${authError.message}`);
    throw new Error(`Failed to authenticate: ${authError.message}`);
  }

  return supabase;
}

teardown("delete test data", async () => {
  const env = getValidatedEnvProperties();
  const supabase = await createSupabaseClient(env);

  logInfo(`Cleaning up data for user: ${env.userId}`);

  // Delete flashcards first due to foreign key constraints
  const { data: deletedFlashcards, error: flashcardsError } = await supabase
    .from("flashcard")
    .delete()
    .eq("user_id", env.userId)
    .select();

  if (flashcardsError) {
    logError(`Error deleting flashcards: ${flashcardsError}`);
  } else {
    logInfo(`Flashcards deleted: ${JSON.stringify(deletedFlashcards)}`);
  }

  // Then delete flashcard groups
  const { data: deletedGroups, error: groupsError } = await supabase
    .from("flashcards_group")
    .delete()
    .eq("user_id", env.userId)
    .select();

  if (groupsError) {
    logError(`Error deleting groups: ${groupsError}`);
  } else {
    logInfo(`Groups deleted: ${JSON.stringify(deletedGroups)}`);
  }
});
