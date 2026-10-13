import { Badge, Button, Container, StatCard } from "@ap/ui";
import type { Metadata } from "next";
import Link from "next/link";

import { HeroSimulator } from "@/components/landing/hero-simulator";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNav } from "@/components/landing/landing-nav";
import { PricingPlans } from "@/components/landing/pricing-plans";
import { ProductMatrix } from "@/components/landing/product-matrix";

export const metadata: Metadata = {
  title: "D2C Business OS · Autonomous Operating System for Modern Brands",
  description:
    "Unify social publishing, omnichannel commerce, automated WhatsApp CRM, and smart fulfillment under a single multi-tenant platform with row-level security.",
};

export default function Home() {
  return (
    <div className="bg-bg text-fg selection:bg-primary flex min-h-screen flex-col selection:text-white">
      {/* Top Sticky Navigation */}
      <LandingNav />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
        {/* Background Radial Glow */}
        <div className="from-primary/15 via-accent/5 pointer-events-none absolute top-0 left-1/2 -z-10 h-[550px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-b to-transparent blur-3xl" />

        <Container size="xl">
          <div className="mx-auto max-w-4xl space-y-6 text-center">
            {/* Announcement Badge */}
            <div className="inline-flex items-center gap-2">
              <Badge tone="brand" dot className="px-3 py-1 text-xs">
                Next-Gen D2C OS v1.0
              </Badge>
              <span className="text-muted hidden text-xs sm:inline">
                Integrated with Postiz Adapter & Supabase PostgreSQL RLS
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl leading-[1.1] font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
              The Autonomous Business OS Built for{" "}
              <span className="from-primary to-accent bg-gradient-to-r via-indigo-400 bg-clip-text text-transparent">
                Scaling D2C Brands
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-muted mx-auto max-w-2xl text-base leading-relaxed sm:text-xl">
              Consolidate fragmented tools into a single multi-tenant platform. Automate social
              publishing, AI campaign briefs, omnichannel inventory sync, and WhatsApp CRM with
              bank-grade isolation.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
              <Link href="/demo/demo-brand">
                <Button variant="glow" size="lg" className="w-full gap-2.5 px-8 sm:w-auto">
                  Launch Live Demo
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </Button>
              </Link>
              <Link href="/onboarding">
                <Button variant="outline" size="lg" className="w-full px-8 sm:w-auto">
                  Set Up Free Workspace
                </Button>
              </Link>
            </div>

            {/* Trust Proof Metrics */}
            <div className="text-muted flex flex-wrap items-center justify-center gap-6 pt-8 text-xs">
              <div className="flex items-center gap-2">
                <span className="bg-success h-1.5 w-1.5 rounded-full" />
                <span>100% Tenant Isolation (RLS)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-primary h-1.5 w-1.5 rounded-full" />
                <span>Zero Missed Events (Postgres Outbox)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-accent h-1.5 w-1.5 rounded-full" />
                <span>Fastify 5 & Python FastAPI</span>
              </div>
            </div>
          </div>

          {/* Interactive Hero Simulator */}
          <div id="simulator" className="mt-14 md:mt-20">
            <div className="mb-6 text-center">
              <span className="text-accent text-xs font-semibold tracking-wider uppercase">
                Interactive Workspace Sandbox
              </span>
              <p className="text-muted mt-1 text-xs">
                Click the tabs below to explore real workflows across the platform
              </p>
            </div>
            <HeroSimulator />
          </div>
        </Container>
      </section>

      {/* Metrics & Benchmark Stats */}
      <section className="border-border/70 bg-surface/40 border-y py-12">
        <Container size="xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Campaign Velocity"
              value="3.8x"
              change="+45%"
              changeTone="success"
              description="Faster end-to-end post rollouts across Instagram & Facebook"
            />
            <StatCard
              label="Tenant Isolation"
              value="100%"
              change="PostgreSQL RLS"
              changeTone="info"
              description="Every query filtered by org and brand with role guards"
            />
            <StatCard
              label="API Latency"
              value="< 42ms"
              change="Fastify 5"
              changeTone="brand"
              description="High-throughput asynchronous platform services"
            />
            <StatCard
              label="Festival Auto-Briefs"
              value="30-Day"
              change="Active"
              changeTone="accent"
              description="Automated pre-festival content suggestions and calendar plans"
            />
          </div>
        </Container>
      </section>

      {/* Product Pillars Section */}
      <section id="products" className="py-20 md:py-28">
        <Container size="xl">
          <div className="mx-auto mb-16 max-w-2xl space-y-3 text-center">
            <Badge tone="accent">Modular Architecture</Badge>
            <h2 className="text-fg text-3xl font-bold tracking-tight sm:text-4xl">
              Four Core Pillars. One Unified Business OS.
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              Every product is an independent, schema-isolated module with its own domain entities,
              manifest, and API services—composed seamlessly within the shell.
            </p>
          </div>

          <ProductMatrix />
        </Container>
      </section>

      {/* Technical Edge & Architecture Deep-Dive */}
      <section id="architecture" className="border-border/80 bg-surface/30 border-t py-20 md:py-28">
        <Container size="xl">
          <div className="mx-auto mb-16 max-w-2xl space-y-3 text-center">
            <Badge tone="brand">Built for Engineering Rigor</Badge>
            <h2 className="text-fg text-3xl font-bold tracking-tight sm:text-4xl">
              Enterprise-Grade Monorepo Architecture
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              Designed with strict Nx boundary enforcement, zero cross-product table pollution, and
              resilient microservices.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="border-border bg-surface space-y-4 rounded-2xl border p-6">
              <div className="bg-primary/15 text-primary flex h-10 w-10 items-center justify-center rounded-xl font-bold">
                1
              </div>
              <h3 className="text-fg text-lg font-semibold">Multi-Tenant by Design</h3>
              <p className="text-muted text-xs leading-relaxed">
                Organizations own Brands. Every database table includes{" "}
                <code className="text-primary font-mono">organization_id</code> and{" "}
                <code className="text-primary font-mono">brand_id</code> with Supabase Row-Level
                Security. Role guards enforce{" "}
                <code className="text-muted font-mono">
                  owner &gt; admin &gt; editor &gt; viewer
                </code>{" "}
                permissions.
              </p>
              <div className="text-accent pt-2 font-mono text-[11px]">Package: @ap/tenant</div>
            </div>

            <div className="border-border bg-surface space-y-4 rounded-2xl border p-6">
              <div className="bg-accent/15 text-accent flex h-10 w-10 items-center justify-center rounded-xl font-bold">
                2
              </div>
              <h3 className="text-fg text-lg font-semibold">Transactional Outbox Pattern</h3>
              <p className="text-muted text-xs leading-relaxed">
                State transitions in social and commerce write events to a PostgreSQL outbox table
                within the same transaction. A background relay guarantees zero missed events for
                automations and analytics.
              </p>
              <div className="text-accent pt-2 font-mono text-[11px]">Event: post.published.v1</div>
            </div>

            <div className="border-border bg-surface space-y-4 rounded-2xl border p-6">
              <div className="bg-success/15 text-success flex h-10 w-10 items-center justify-center rounded-xl font-bold">
                3
              </div>
              <h3 className="text-fg text-lg font-semibold">Publisher Adapter Pattern</h3>
              <p className="text-muted text-xs leading-relaxed">
                Products never talk directly to third-party APIs. The social engine speaks to an
                abstract <code className="text-primary font-mono">Publisher</code> interface via{" "}
                <code className="text-primary font-mono">integrations-api</code>, making it easy to
                swap Postiz for direct Meta Graph API.
              </p>
              <div className="text-accent pt-2 font-mono text-[11px]">
                Connector: connectors/postiz
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-28">
        <Container size="xl">
          <div className="mx-auto mb-16 max-w-2xl space-y-3 text-center">
            <Badge tone="success">Simple, Predictable Plans</Badge>
            <h2 className="text-fg text-3xl font-bold tracking-tight sm:text-4xl">
              Transparent Pricing for Every Stage
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              Start free with your first brand. Upgrade as you add more channels, automated outbox
              flows, and team members.
            </p>
          </div>

          <PricingPlans />
        </Container>
      </section>

      {/* Final High-Impact Bottom CTA */}
      <section className="border-border/80 from-surface-2 to-bg relative overflow-hidden border-t bg-gradient-to-b py-20 text-center">
        <div className="from-primary/10 pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] via-transparent to-transparent" />
        <Container size="md">
          <div className="space-y-6">
            <Badge tone="brand">Ready to Scale?</Badge>
            <h2 className="text-fg text-3xl font-extrabold tracking-tight sm:text-5xl">
              Experience the Autonomous Operating System
            </h2>
            <p className="text-muted mx-auto max-w-xl text-base leading-relaxed">
              Take a spin through the live demo brand or configure a self-hosted workspace in
              minutes.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row">
              <Link href="/demo/demo-brand">
                <Button variant="glow" size="lg" className="w-full gap-2 px-8 sm:w-auto">
                  Launch Demo Brand
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="w-full px-8 sm:w-auto">
                  Sign In to Account
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Global Footer */}
      <LandingFooter />
    </div>
  );
}
