import type { SupabaseClient } from "@supabase/supabase-js";

export interface ProfileRecord {
  user_id: string;
  email: string | null;
  phone: string | null;
  full_name?: string | null;
  avatar_path?: string | null;
  last_workspace_id?: string | null;
  phone_verified_at?: string | null;
  updated_at?: string;
}

export interface SupabaseQueryResult<T> {
  data: T | null;
  error: { message?: string; code?: string; details?: string } | null | unknown;
}

/**
 * Execute a query targeting the `core` schema first, with automatic fallback to default schema.
 */
export async function safeSchemaQuery<T = Record<string, unknown>>(
  supabase: SupabaseClient,
  run: (db: { from: SupabaseClient["from"] }) => PromiseLike<SupabaseQueryResult<T>>,
): Promise<SupabaseQueryResult<T>> {
  try {
    const coreDb = typeof supabase.schema === "function" ? supabase.schema("core") : supabase;
    const res = await run(coreDb as unknown as { from: SupabaseClient["from"] });
    if (!res.error) return res as SupabaseQueryResult<T>;
    return (await run(supabase)) as SupabaseQueryResult<T>;
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Upsert a user record in `core.profiles` matching the table schema.
 * Includes foreign key recovery if `last_workspace_id` is invalid or not yet created.
 */
export async function upsertUserProfile(
  supabase: SupabaseClient,
  record: ProfileRecord,
): Promise<{ success: boolean; error: unknown | null }> {
  const payload = {
    ...record,
    updated_at: record.updated_at || new Date().toISOString(),
  };

  let { error } = await safeSchemaQuery(supabase, (db) =>
    db.from("profiles").upsert(payload, { onConflict: "user_id" }),
  );

  // If foreign key constraint on last_workspace_id fails, retry with null
  if (error && payload.last_workspace_id) {
    const retryRes = await safeSchemaQuery(supabase, (db) =>
      db
        .from("profiles")
        .upsert({ ...payload, last_workspace_id: null }, { onConflict: "user_id" }),
    );
    if (!retryRes.error) {
      error = null;
    }
  }

  return {
    success: !error,
    error,
  };
}

/**
 * Retrieve user profile from `core.profiles` by user ID.
 */
export async function getUserProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ data: ProfileRecord | null; error: unknown | null }> {
  const res = await safeSchemaQuery<ProfileRecord>(supabase, (db) =>
    db.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
  );
  return {
    data: res.data,
    error: res.error,
  };
}
