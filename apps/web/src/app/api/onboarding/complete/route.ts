import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getUserProfile, upsertUserProfile } from "@/lib/supabase/profiles";

function formatPhoneNumber(phone?: string | null): string {
  if (!phone) return "+919875248929";
  const digits = phone.replace(/[^0-9]/g, "");
  if (phone.trim().startsWith("+")) {
    return `+${digits}`;
  }
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  return digits.length > 0 ? `+${digits}` : "+919875248929";
}

function formatCompanySizeEnum(size?: string | null): string {
  if (!size) return "SIZE_1_10";
  const s = size.trim();
  if (s.startsWith("SIZE_")) return s;
  if (s === "1-10" || s === "1_10") return "SIZE_1_10";
  if (s === "11-50" || s === "11_50") return "SIZE_11_50";
  if (s === "51-200" || s === "51_200") return "SIZE_51_200";
  if (s === "201-500" || s === "201_500") return "SIZE_201_500";
  if (s === "500+" || s === "500_plus" || s === "500") return "SIZE_500_PLUS";
  return `SIZE_${s.replace(/[^a-zA-Z0-9]+/g, "_").toUpperCase()}`;
}

function formatCountry(country?: string | null): string {
  if (!country) return "India";
  return country.replace(/\s+[A-Z]{2}$/, "").trim() || country;
}

function formatTimezone(tz?: string | null): string {
  if (!tz) return "Asia/Kolkata";
  return tz.replace(/\s*\(UTC[^)]*\)/i, "").trim() || tz;
}

function isValidUUID(val?: string | null): boolean {
  if (!val) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      workspaceId,
      userId,
      onboardingPath,
      companyName,
      phone,
      email,
      website,
      country,
      state,
      timezone,
      gstin,
      industry,
      companySize,
      businessProfile,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const resolvedCompanyName =
      companyName || businessProfile?.brandName || businessProfile?.companyName || "test";
    const resolvedPhone = formatPhoneNumber(
      phone || businessProfile?.phoneNumber || businessProfile?.phone,
    );
    const resolvedEmail = email || businessProfile?.email || "user@business.com";
    const resolvedWebsite =
      website || businessProfile?.website || businessProfile?.websiteUrl || null;
    const resolvedCountry = formatCountry(country || businessProfile?.country);
    const resolvedState = state || businessProfile?.state || "Gujarat";
    const resolvedTimezone = formatTimezone(timezone || businessProfile?.timezone);
    const resolvedGstin = gstin || businessProfile?.gstin || null;
    const resolvedIndustry = industry || businessProfile?.industry || "Technology & Software";
    const resolvedCompanySize = formatCompanySizeEnum(
      companySize || businessProfile?.size || businessProfile?.companySize,
    );

    const supabase = createSupabaseAdminClient();
    const now = new Date().toISOString();

    // 1. Update workspace in core.workspaces: set name to companyName
    let workspaceSlug = "my-workspace-8b28d5";
    let updatedWorkspaceRecord: Record<string, unknown> | null = null;

    if (workspaceId) {
      try {
        const cleanSlugBase = resolvedCompanyName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        const newSlug = cleanSlugBase
          ? `${cleanSlugBase}-${workspaceId
              .replace(/[^a-zA-Z0-9]/g, "")
              .slice(0, 6)
              .toLowerCase()}`
          : undefined;

        const updatePayload: Record<string, unknown> = {
          name: resolvedCompanyName,
          onboarding_path: onboardingPath || "fresh",
          onboarding_step: "step_3_completed",
          updated_at: now,
        };

        if (newSlug) {
          updatePayload.slug = newSlug;
        }

        const { data: updatedWs, error: wsErr } = await supabase
          .schema("core")
          .from("workspaces")
          .update(updatePayload)
          .eq("id", workspaceId)
          .select()
          .maybeSingle();

        if (updatedWs) {
          updatedWorkspaceRecord = updatedWs;
          if (updatedWs.slug) {
            workspaceSlug = updatedWs.slug;
          }
        } else if (newSlug) {
          workspaceSlug = newSlug;
        }

        if (wsErr) {
          console.warn("[onboarding-complete] workspace update note:", wsErr.message);
          // If slug update conflict, try without slug update
          const { data: retryWs } = await supabase
            .schema("core")
            .from("workspaces")
            .update({
              name: resolvedCompanyName,
              onboarding_path: onboardingPath || "fresh",
              onboarding_step: "step_3_completed",
              updated_at: now,
            })
            .eq("id", workspaceId)
            .select()
            .maybeSingle();

          if (retryWs) {
            updatedWorkspaceRecord = retryWs;
            if (retryWs.slug) {
              workspaceSlug = retryWs.slug;
            }
          }
        }

        // Also update core.organizations if present
        try {
          await supabase
            .schema("core")
            .from("organizations")
            .update({ name: resolvedCompanyName })
            .eq("id", workspaceId);
        } catch {
          // ignore
        }
      } catch (wsErr) {
        console.warn("[onboarding-complete] workspace update exception:", wsErr);
      }
    }

    // Determine profile ID (valid UUID)
    let profileId: string = isValidUUID(workspaceId) ? workspaceId : "";
    if (updatedWorkspaceRecord?.id && isValidUUID(String(updatedWorkspaceRecord.id))) {
      profileId = String(updatedWorkspaceRecord.id);
    }
    if (!profileId) {
      profileId = crypto.randomUUID();
    }

    const companyProfileData = {
      id: profileId,
      companyName: resolvedCompanyName,
      email: resolvedEmail,
      gstin: resolvedGstin ? String(resolvedGstin).trim() : null,
      phoneNumber: resolvedPhone,
      isProfileCompleted: true,
      providerBusinessId: null,
      industry: resolvedIndustry,
      size: resolvedCompanySize,
      website: resolvedWebsite ? String(resolvedWebsite).trim() : null,
      timezone: resolvedTimezone,
      leadDigestEmail: null,
      leadDigestMorningEnabled: true,
      leadDigestEveningEnabled: true,
      leadDigestCustomTimeOne: null,
      leadDigestCustomTimeTwo: null,
      country: resolvedCountry,
      state: resolvedState,
      city: null,
      companyProfileImage: null,
      createdAt: (updatedWorkspaceRecord?.created_at as string) || now,
      updatedAt: now,
      deletedAt: null,
      companyProfileUrl: null,
    };

    // Save full companyProfile in workspace settings for complete persistence
    if (workspaceId) {
      try {
        await supabase
          .schema("core")
          .from("workspaces")
          .update({
            settings: {
              path: onboardingPath || "fresh",
              step: 3,
              status: "step_3_completed",
              completedAt: now,
              companyProfile: companyProfileData,
            },
          })
          .eq("id", workspaceId);
      } catch {
        // ignore
      }
    }

    // 2. Ensure user profile in core.profiles is updated with company name and last_workspace_id
    const { data: existingProfile } = await getUserProfile(supabase, userId);
    const assignedWsId = workspaceId || existingProfile?.last_workspace_id || userId;

    await upsertUserProfile(supabase, {
      user_id: userId,
      email: resolvedEmail || existingProfile?.email || null,
      phone: resolvedPhone || existingProfile?.phone || null,
      full_name: resolvedCompanyName || existingProfile?.full_name || null,
      last_workspace_id: assignedWsId,
      updated_at: now,
    });

    return NextResponse.json({
      statusCode: 200,
      success: true,
      message: "Operation successful",
      data: companyProfileData,
      workspaceSlug,
      workspaceName: resolvedCompanyName,
      redirectUrl: `/${workspaceSlug}/default-brand`,
    });
  } catch (err: unknown) {
    console.error("[onboarding-complete error]:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        statusCode: 500,
        success: false,
        message,
        error: message,
      },
      { status: 500 },
    );
  }
}
