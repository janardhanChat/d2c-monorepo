"use client";

import { Badge, Button } from "@ap/ui";
import { useState } from "react";

type SimulatorTab = "calendar" | "ai" | "automations" | "security";

export function HeroSimulator() {
  const [activeTab, setActiveTab] = useState<SimulatorTab>("calendar");
  const [approvalState, setApprovalState] = useState<"pending" | "approved">("pending");
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [selectedTone, setSelectedTone] = useState<"luxe" | "viral" | "festive">("festive");

  return (
    <div className="relative mx-auto w-full max-w-5xl">
      {/* Ambient background glow behind mockup */}
      <div className="from-primary/30 via-accent/20 to-primary/30 absolute -inset-1 -z-10 rounded-3xl bg-gradient-to-r opacity-70 blur-2xl transition duration-1000" />

      {/* Main mockup frame */}
      <div className="border-border/80 bg-surface/90 overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl">
        {/* Mock Window Top Bar */}
        <div className="border-border/60 bg-surface-2/80 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="bg-danger/80 h-3 w-3 rounded-full" />
              <span className="bg-warning/80 h-3 w-3 rounded-full" />
              <span className="bg-success/80 h-3 w-3 rounded-full" />
            </div>
            <div className="bg-surface text-muted border-border-subtle ml-3 hidden items-center gap-2 rounded-md border px-2.5 py-1 text-xs sm:flex">
              <span className="bg-success h-2 w-2 animate-pulse rounded-full" />
              <span className="text-fg font-medium">Rejoice Organics</span>
              <span className="text-subtle">/</span>
              <span>Skincare & Apparel</span>
            </div>
          </div>

          {/* Interactive Mode Tabs */}
          <div className="bg-surface border-border-subtle flex items-center gap-1 rounded-lg border p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab("calendar")}
              className={`cursor-pointer rounded-md px-3 py-1.5 transition-all ${
                activeTab === "calendar"
                  ? "bg-primary text-primary-fg shadow-sm"
                  : "text-muted hover:text-fg"
              }`}
            >
              Social Scheduler
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ai")}
              className={`cursor-pointer rounded-md px-3 py-1.5 transition-all ${
                activeTab === "ai"
                  ? "bg-primary text-primary-fg shadow-sm"
                  : "text-muted hover:text-fg"
              }`}
            >
              AI Studio
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("automations")}
              className={`cursor-pointer rounded-md px-3 py-1.5 transition-all ${
                activeTab === "automations"
                  ? "bg-primary text-primary-fg shadow-sm"
                  : "text-muted hover:text-fg"
              }`}
            >
              Outbox Flows
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("security")}
              className={`cursor-pointer rounded-md px-3 py-1.5 transition-all ${
                activeTab === "security"
                  ? "bg-primary text-primary-fg shadow-sm"
                  : "text-muted hover:text-fg"
              }`}
            >
              Tenant RLS
            </button>
          </div>
        </div>

        {/* Tab 1: Social Calendar & Post Life-Cycle */}
        {activeTab === "calendar" && (
          <div className="space-y-6 p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h4 className="text-fg flex items-center gap-2 text-base font-semibold">
                  Social Media Operations
                  <Badge tone="success" dot>
                    Postiz Active
                  </Badge>
                </h4>
                <p className="text-muted text-xs">
                  Multi-channel publishing engine connected to Instagram, Facebook & LinkedIn
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    setApprovalState((prev) => (prev === "pending" ? "approved" : "pending"))
                  }
                >
                  {approvalState === "pending" ? "Simulate Approve All" : "Reset Backlog"}
                </Button>
                <Button size="sm" variant="glow">
                  + Create Post
                </Button>
              </div>
            </div>

            {/* Simulated Post Queue */}
            <div className="grid gap-4 md:grid-cols-3">
              {/* Post 1: Scheduled */}
              <div className="border-border bg-surface-2/60 space-y-3 rounded-xl border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-fg text-xs font-semibold">Oct 14 · 18:30 IST</span>
                  <Badge tone="info">Scheduled</Badge>
                </div>
                <div className="border-border flex aspect-video w-full items-center justify-center rounded-lg border bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 p-3 text-center">
                  <p className="text-fg text-xs font-medium">
                    ✨ Festive Radiance Serum — 20% Off Limited Bundle
                  </p>
                </div>
                <div className="text-muted flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="bg-accent h-2 w-2 rounded-full" /> Instagram & FB
                  </span>
                  <span className="text-accent font-medium">Auto-pilot</span>
                </div>
              </div>

              {/* Post 2: Approval Needed */}
              <div className="border-border bg-surface-2/60 space-y-3 rounded-xl border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-fg text-xs font-semibold">Oct 16 · 12:00 IST</span>
                  <Badge tone={approvalState === "pending" ? "warning" : "success"} dot>
                    {approvalState === "pending" ? "Needs Approval" : "Approved"}
                  </Badge>
                </div>
                <div className="border-border flex aspect-video w-full items-center justify-center rounded-lg border bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 p-3 text-center">
                  <p className="text-fg text-xs font-medium">
                    🌿 Behind the formulation: Organic Cold-Pressed Rosehip
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted">Brand Manager Review</span>
                  <button
                    type="button"
                    onClick={() => setApprovalState("approved")}
                    className="text-primary cursor-pointer font-semibold hover:underline"
                  >
                    {approvalState === "pending" ? "Approve Now →" : "Ready"}
                  </button>
                </div>
              </div>

              {/* Post 3: AI Generated */}
              <div className="border-border bg-surface-2/60 space-y-3 rounded-xl border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-fg text-xs font-semibold">Diwali Week Draft</span>
                  <Badge tone="brand">AI Generated</Badge>
                </div>
                <div className="border-border flex aspect-video w-full items-center justify-center rounded-lg border bg-gradient-to-br from-cyan-950 via-slate-900 to-blue-950 p-3 text-center">
                  <p className="text-fg text-xs font-medium">
                    🪔 5 Skincare Rituals Before Diwali Evening Lights
                  </p>
                </div>
                <div className="text-muted flex items-center justify-between text-xs">
                  <span className="text-accent">Festival Intelligence</span>
                  <span className="font-mono text-[11px]">Score 96%</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics Banner */}
            <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
              <div className="bg-surface border-border-subtle rounded-lg border p-3 text-center">
                <div className="text-fg text-lg font-bold">34</div>
                <div className="text-muted text-[11px]">Posts Queued</div>
              </div>
              <div className="bg-surface border-border-subtle rounded-lg border p-3 text-center">
                <div className="text-success text-lg font-bold">+38.4%</div>
                <div className="text-muted text-[11px]">Organic Reach</div>
              </div>
              <div className="bg-surface border-border-subtle rounded-lg border p-3 text-center">
                <div className="text-accent text-lg font-bold">&lt; 3 min</div>
                <div className="text-muted text-[11px]">Avg. Draft Time</div>
              </div>
              <div className="bg-surface border-border-subtle rounded-lg border p-3 text-center">
                <div className="text-fg text-lg font-bold">100%</div>
                <div className="text-muted text-[11px]">On-Time Delivery</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: AI Content Studio */}
        {activeTab === "ai" && (
          <div className="space-y-5 p-6">
            <div>
              <h4 className="text-fg flex items-center gap-2 text-base font-semibold">
                FastAPI AI Microservice
                <Badge tone="accent">Python FastAPI · Port 8000</Badge>
              </h4>
              <p className="text-muted text-xs">
                Generates high-converting captions, festival hooks, and 30-day content calendars
              </p>
            </div>

            {/* Tone Selector */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted mr-1 text-xs font-medium">Brand Voice:</span>
              <button
                type="button"
                onClick={() => setSelectedTone("festive")}
                className={`cursor-pointer rounded-md px-2.5 py-1 text-xs transition-colors ${
                  selectedTone === "festive"
                    ? "bg-primary text-primary-fg font-medium"
                    : "bg-surface-2 text-muted hover:text-fg"
                }`}
              >
                🪔 Indian Festive & Warm
              </button>
              <button
                type="button"
                onClick={() => setSelectedTone("luxe")}
                className={`cursor-pointer rounded-md px-2.5 py-1 text-xs transition-colors ${
                  selectedTone === "luxe"
                    ? "bg-primary text-primary-fg font-medium"
                    : "bg-surface-2 text-muted hover:text-fg"
                }`}
              >
                💎 Clean Luxury Botanical
              </button>
              <button
                type="button"
                onClick={() => setSelectedTone("viral")}
                className={`cursor-pointer rounded-md px-2.5 py-1 text-xs transition-colors ${
                  selectedTone === "viral"
                    ? "bg-primary text-primary-fg font-medium"
                    : "bg-surface-2 text-muted hover:text-fg"
                }`}
              >
                🔥 Viral Instagram Reel Hook
              </button>
            </div>

            {/* Generated Output Preview */}
            <div className="border-border bg-surface-2 space-y-3 rounded-xl border p-4 font-sans">
              <div className="text-muted border-border-subtle flex items-center justify-between border-b pb-2 text-xs">
                <span>Model: GPT-4o-mini / Claude 3.5 Sonnet</span>
                <span className="text-success font-medium">Verified by Brand Guidelines</span>
              </div>
              <p className="text-fg text-sm leading-relaxed">
                {selectedTone === "festive" &&
                  "✨ Your skin deserves to glow as brightly as your home this Diwali. Formulated with 100% cold-pressed organic rosehip & squalane, our Festive Elixir brings natural, non-greasy radiance in just 3 drops. Tap the link in bio to claim the early festive gift set before stocks run out! 🪔 #DiwaliGlow #CleanSkincare #RejoiceBotanicals"}
                {selectedTone === "luxe" &&
                  "Pure botanical discipline. Minimal ingredients, maximum clinical efficacy. Our cold-pressed botanical nectar restores your moisture barrier overnight without synthetic fragrance or fillers. Experience clean luxury. #MinimalistBeauty #ModernD2C #BarrierRepair"}
                {selectedTone === "viral" &&
                  "Stop wasting money on 7-step skincare routines that clog your pores! 🛑 Here is why dermatologists are switching to single-origin cold pressed oils this season 👇 (Save this reel for your night routine!) #SkinHacks #GlowUp #D2CBeauty"}
              </p>
              <div className="flex items-center justify-between pt-2">
                <span className="text-muted text-xs">Character count: 284 · Hashtags: 3</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setCopiedCaption(true);
                    setTimeout(() => setCopiedCaption(false), 2000);
                  }}
                >
                  {copiedCaption ? "✓ Copied to clipboard" : "Copy Caption"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Outbox Flows & Event Automation */}
        {activeTab === "automations" && (
          <div className="space-y-5 p-6">
            <div>
              <h4 className="text-fg flex items-center gap-2 text-base font-semibold">
                Transactional Outbox & Event Relay
                <Badge tone="brand">Guaranteed Zero Missed Events</Badge>
              </h4>
              <p className="text-muted text-xs">
                Postgres outbox pattern triggers automations reliably when social or commerce states
                mutate
              </p>
            </div>

            {/* Flow Visualizer */}
            <div className="space-y-3">
              <div className="flex flex-col items-center gap-3 md:flex-row">
                <div className="border-border bg-surface-2 w-full rounded-lg border p-3 md:w-1/3">
                  <div className="text-accent text-[11px] font-bold tracking-wider uppercase">
                    Trigger Event
                  </div>
                  <div className="text-fg mt-1 font-mono text-xs">post.published.v1</div>
                  <div className="text-muted mt-1 text-[11px]">
                    Payload: brandId, platform, reach
                  </div>
                </div>
                <div className="text-muted hidden md:block">→</div>
                <div className="border-border bg-surface-2 w-full rounded-lg border p-3 md:w-1/3">
                  <div className="text-primary text-[11px] font-bold tracking-wider uppercase">
                    Action 1: WhatsApp CRM
                  </div>
                  <div className="text-fg mt-1 text-xs">Send VIP Flash Alert</div>
                  <div className="text-muted mt-1 text-[11px]">
                    Broadcast to top 500 repeat buyers
                  </div>
                </div>
                <div className="text-muted hidden md:block">→</div>
                <div className="border-border bg-surface-2 w-full rounded-lg border p-3 md:w-1/3">
                  <div className="text-success text-[11px] font-bold tracking-wider uppercase">
                    Action 2: Commerce Sync
                  </div>
                  <div className="text-fg mt-1 text-xs">Reserve Promotional Stock</div>
                  <div className="text-muted mt-1 text-[11px]">Prevent out-of-stock bounce</div>
                </div>
              </div>

              {/* Simulated Log Output */}
              <div className="bg-bg border-border-subtle text-muted space-y-1 rounded-lg border p-3 font-mono text-[11px]">
                <div className="text-success">
                  [OUTBOX RELAY] Event #8942 committed to social.outbox
                </div>
                <div className="text-fg">
                  [PUBLISHER] Dispatched to Postiz adapter (latency: 142ms)
                </div>
                <div className="text-accent">
                  [WEBHOOK] Received 200 OK from Meta Graph API (Instagram post id: 1802938472)
                </div>
                <div className="text-primary">
                  [AUTOMATION] Triggered WhatsApp broadcast queue (500 recipients)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Tenant RLS Security */}
        {activeTab === "security" && (
          <div className="space-y-5 p-6">
            <div>
              <h4 className="text-fg flex items-center gap-2 text-base font-semibold">
                Multi-Tenant Isolation & Role Guard
                <Badge tone="success" dot>
                  PostgreSQL RLS
                </Badge>
              </h4>
              <p className="text-muted text-xs">
                Every query is automatically filtered by organization and brand. Cross-tenant reads
                are impossible.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="border-border bg-surface-2 space-y-2 rounded-lg border p-3.5">
                <span className="text-fg flex items-center gap-1.5 text-xs font-semibold">
                  <span className="bg-accent h-2 w-2 rounded-full" /> Injected Request Headers
                </span>
                <div className="text-muted bg-surface border-border-subtle space-y-1 rounded border p-2.5 font-mono text-xs">
                  <div>x-organization-id: org_rejoice_82</div>
                  <div>x-brand-id: brand_skincare_01</div>
                  <div>authorization: Bearer eyJhbGci...</div>
                </div>
              </div>

              <div className="border-border bg-surface-2 space-y-2 rounded-lg border p-3.5">
                <span className="text-fg flex items-center gap-1.5 text-xs font-semibold">
                  <span className="bg-primary h-2 w-2 rounded-full" /> RLS Enforcement Policy
                </span>
                <div className="text-muted bg-surface border-border-subtle space-y-1 rounded border p-2.5 font-mono text-xs">
                  <div>POLICY "tenant_isolation" ON social.posts</div>
                  <div className="text-accent">
                    USING (core.is_member(auth.uid(), organization_id))
                  </div>
                  <div className="text-success">WITH CHECK (brand_id = current_brand_id())</div>
                </div>
              </div>
            </div>

            <div className="bg-surface border-border-subtle text-muted flex items-center justify-between rounded-lg border p-3 text-xs">
              <span>
                Membership Resolver: <strong>@ap/tenant</strong> cached for 30s in-memory
              </span>
              <span className="text-success font-semibold">
                403 Forbidden on Cross-Tenant Injections
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
