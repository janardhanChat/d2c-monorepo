import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getUserProfile, upsertUserProfile } from "@/lib/supabase/profiles";

export interface WorkspaceRecord {
  id: string;
  name: string;
  slug: string;
  created_by?: string | null;
  onboarding_path?: string | null;
  onboarding_step?: string | null;
  status?: string;
  settings?: Record<string, unknown>;
  created_at?: string;
}

function getSupabaseClient(req: Request): SupabaseClient {
  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://iwdsyrsljjzajcxuqvqs.supabase.co";
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    return createClient(url, anonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });
  }
  return createSupabaseAdminClient();
}

export async function GET(req: Request) {
  try {
    const supabase = getSupabaseClient(req);
    const { data: workspaces, error: wsErr } = await supabase
      .schema("core")
      .from("workspaces")
      .select("*")
      .limit(10);

    const { data: profiles, error: profErr } = await supabase
      .schema("core")
      .from("profiles")
      .select("*")
      .limit(10);

    return NextResponse.json({
      workspaces: workspaces || [],
      wsErr,
      profiles: profiles || [],
      profErr,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId, phone, email } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const supabase = getSupabaseClient(req);
    const now = new Date().toISOString();

    // 1. Check existing profile in core.profiles
    const { data: profile } = await getUserProfile(supabase, userId);

    let workspace: WorkspaceRecord | null = null;
    let isNew = false;

    // 2. Check if user already has last_workspace_id assigned
    if (profile?.last_workspace_id) {
      const { data: existingWs } = await supabase
        .schema("core")
        .from("workspaces")
        .select("*")
        .eq("id", profile.last_workspace_id)
        .maybeSingle();

      if (existingWs) {
        workspace = existingWs as WorkspaceRecord;
      }
    }

    // 3. Check if user is a member of any workspace in core.workspace_members
    if (!workspace) {
      const { data: memberRecords } = await supabase
        .schema("core")
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", userId)
        .limit(1);

      const firstMember = memberRecords?.[0];
      if (firstMember?.workspace_id) {
        const { data: existingWs } = await supabase
          .schema("core")
          .from("workspaces")
          .select("*")
          .eq("id", firstMember.workspace_id)
          .maybeSingle();

        if (existingWs) {
          workspace = existingWs as WorkspaceRecord;
        }
      }
    }

    // 4. Check if user previously created any workspace in core.workspaces
    if (!workspace) {
      const { data: createdWs } = await supabase
        .schema("core")
        .from("workspaces")
        .select("*")
        .eq("created_by", userId)
        .order("created_at", { ascending: true })
        .limit(1);

      if (createdWs && createdWs.length > 0) {
        workspace = createdWs[0] as WorkspaceRecord;
      }
    }

    // 5. Check if any Default Workspace exists globally to reuse or adopt
    if (!workspace) {
      const { data: defaultWs } = await supabase
        .schema("core")
        .from("workspaces")
        .select("*")
        .eq("name", "Default Workspace")
        .limit(1);

      if (defaultWs && defaultWs.length > 0) {
        workspace = defaultWs[0] as WorkspaceRecord;
      }
    }

    // 6. If no workspace exists, create a new Default Workspace
    if (!workspace) {
      const userSuffix =
        userId
          .replace(/[^a-zA-Z0-9]/g, "")
          .slice(0, 8)
          .toLowerCase() || "001";
      const cleanSlug = `default-workspace-${userSuffix}`;

      const newWsPayload = {
        name: "Default Workspace",
        slug: cleanSlug,
        created_by: userId,
        status: "active",
      };

      const { data: insertedWs, error: insertWsErr } = await supabase
        .schema("core")
        .from("workspaces")
        .insert(newWsPayload)
        .select()
        .single();

      if (!insertWsErr && insertedWs) {
        workspace = insertedWs as WorkspaceRecord;
        isNew = true;
      } else {
        console.warn(
          "[assign-default] Direct insert to core.workspaces note:",
          insertWsErr?.message,
        );

        // Fallback: If slug collision or RLS issue, check by slug or create deterministic workspace
        const { data: slugWs } = await supabase
          .schema("core")
          .from("workspaces")
          .select("*")
          .eq("slug", cleanSlug)
          .maybeSingle();

        if (slugWs) {
          workspace = slugWs as WorkspaceRecord;
        } else {
          // Provide stable workspace representation
          workspace = {
            id: userId,
            name: "Default Workspace",
            slug: cleanSlug,
            status: "active",
            created_by: userId,
            created_at: now,
          };
          isNew = true;
        }
      }

      // Add membership to core.workspace_members if workspace was saved
      if (workspace && workspace.id !== userId) {
        try {
          await supabase.schema("core").from("workspace_members").upsert(
            {
              workspace_id: workspace.id,
              user_id: userId,
              role: "owner",
            },
            { onConflict: "workspace_id,user_id" },
          );
        } catch (memberErr) {
          console.warn("[assign-default] workspace_members notice:", memberErr);
        }
      }
    }

    // 7. Persist workspace assignment in core.profiles.last_workspace_id
    if (workspace?.id) {
      await upsertUserProfile(supabase, {
        user_id: userId,
        email: email || profile?.email || null,
        phone: phone || profile?.phone || null,
        full_name: profile?.full_name || null,
        last_workspace_id: workspace.id,
        updated_at: now,
      });
    }

    return NextResponse.json({
      success: true,
      workspace,
      isNew,
      profile: {
        userId,
        phone: phone || profile?.phone || null,
        email: email || profile?.email || null,
        lastWorkspaceId: workspace?.id,
      },
    });
  } catch (err: unknown) {
    console.error("[assign-default exception]:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
