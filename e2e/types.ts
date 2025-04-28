export interface EnvProperties {
  supabaseUrl: string;
  supabaseKey: string;
  userId: string;
  email: string;
  password: string;
}

export function getValidatedEnvProperties(): EnvProperties {
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
