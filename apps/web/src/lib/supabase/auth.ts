import { createSupabaseBrowserClient } from "./browser";

/**
 * Reusable authentication & session management helpers.
 */

/** Request SMS OTP for a phone number (E.164 format e.g. +919875248929). */
export async function sendPhoneOtp(phone: string) {
  const supabase = createSupabaseBrowserClient();
  return supabase.auth.signInWithOtp({
    phone,
    options: {
      channel: "sms",
    },
  });
}

/** Verify a 6-digit SMS OTP token for a phone number. */
export async function verifyPhoneOtp(phone: string, token: string) {
  const supabase = createSupabaseBrowserClient();
  return supabase.auth.verifyOtp({
    phone,
    token,
    type: "sms",
  });
}

/** Sign out the current user session and clear auth tokens. */
export async function signOut() {
  const supabase = createSupabaseBrowserClient();
  return supabase.auth.signOut();
}

/** Retrieve the current active session in the browser. */
export async function getBrowserSession() {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.auth.getSession();
  return { session: data?.session ?? null, error };
}

/** Retrieve the current authenticated user in the browser. */
export async function getBrowserUser() {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.auth.getUser();
  return { user: data?.user ?? null, error };
}
