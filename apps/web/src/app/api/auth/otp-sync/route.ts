import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getUserProfile, upsertUserProfile } from "@/lib/supabase/profiles";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const supabase = createSupabaseAdminClient();

    const userId = body.userId;
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const phone = body.phone || null;
    const email = body.email || null;
    const now = new Date().toISOString();

    // 1. Check if user already has an existing workspace
    const { data: existingProfile } = await getUserProfile(supabase, userId);

    // 2. Upsert profiles matching core.profiles schema
    const phoneVerifiedAt =
      body.phoneVerifiedAt || body.mobileVerifiedAt || body.phoneConfirmedAt || now;

    const profilePayload = {
      user_id: userId,
      email,
      phone,
      full_name: body.fullName || null,
      last_workspace_id: existingProfile?.last_workspace_id || null,
      phone_verified_at: phoneVerifiedAt,
      updated_at: now,
    };

    const { success, error: profileErr } = await upsertUserProfile(supabase, profilePayload);

    if (profileErr) {
      console.error("[otp-sync] Profile upsert error:", profileErr);
    }

    return NextResponse.json({
      success,
      userId,
      workspaceId: profilePayload.last_workspace_id,
      profileError: profileErr
        ? (profileErr as { message?: string })?.message || String(profileErr)
        : null,
    });
  } catch (err) {
    console.error("[otp-sync error]", err);
    return NextResponse.json({ error: "Failed to sync OTP user" }, { status: 500 });
  }
}
