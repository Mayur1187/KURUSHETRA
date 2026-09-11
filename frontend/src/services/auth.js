import { isSupabaseConfigured, supabase } from "./supabaseClient";

/**
 * Auth service - every auth interaction in the app goes through here,
 * so swapping or extending the auth provider later (Google, GitHub,
 * SSO) only means changing this file.
 */

export async function signUp(email, password, name) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPassword(email) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}

export async function getSession() {
  if (!isSupabaseConfigured()) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthStateChange(callback) {
  if (!isSupabaseConfigured()) return { data: { subscription: { unsubscribe() {} } } };
  return supabase.auth.onAuthStateChange((_event, session) => callback(session));
}

export async function getAccessToken() {
  const session = await getSession();
  return session?.access_token || null;
}
