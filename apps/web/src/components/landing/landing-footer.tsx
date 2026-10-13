import { Badge, Container } from "@ap/ui";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-border/80 bg-surface/50 text-muted border-t pt-14 pb-12 text-xs backdrop-blur-sm">
      <Container size="xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="from-primary to-accent flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr shadow-sm">
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <span className="text-fg text-base font-bold">D2C Business OS</span>
            </div>
            <p className="text-muted max-w-sm text-xs leading-relaxed">
              The autonomous, multi-tenant operating system for direct-to-consumer brands and SMBs.
              Engineered with Fastify 5, Python FastAPI, Next.js 16, and self-hosted Supabase with
              PostgreSQL RLS.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Badge tone="success" dot className="text-[11px]">
                Core Services: Operational
              </Badge>
              <span className="text-subtle">·</span>
              <span className="text-muted text-[11px]">Node 22 / pnpm 10</span>
            </div>
          </div>

          {/* Column 1: Products */}
          <div className="space-y-3">
            <p className="text-fg text-[11px] font-semibold tracking-wide uppercase">
              Product Pillars
            </p>
            <ul className="space-y-2">
              <li>
                <Link href="/demo/demo-brand/social" className="hover:text-fg transition-colors">
                  Social Automation (Active)
                </Link>
              </li>
              <li>
                <span className="text-subtle">Omnichannel Commerce (Beta)</span>
              </li>
              <li>
                <span className="text-subtle">Smart WhatsApp CRM</span>
              </li>
              <li>
                <span className="text-subtle">Autonomous Fulfillment</span>
              </li>
              <li>
                <Link
                  href="/demo/demo-brand/automations"
                  className="hover:text-fg transition-colors"
                >
                  Transactional Outbox Flows
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Architecture & Dev */}
          <div className="space-y-3">
            <p className="text-fg text-[11px] font-semibold tracking-wide uppercase">
              Architecture
            </p>
            <ul className="space-y-2">
              <li>
                <a
                  href="http://localhost:4000/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-fg transition-colors"
                >
                  core-api Swagger Docs
                </a>
              </li>
              <li>
                <a
                  href="http://localhost:4010/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-fg transition-colors"
                >
                  integrations-api Docs
                </a>
              </li>

              <li>
                <a
                  href="http://localhost:6006"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-fg transition-colors"
                >
                  @ap/ui Storybook
                </a>
              </li>
              <li>
                <span className="text-subtle">Traefik Reverse Proxy (:8080)</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div className="space-y-3">
            <p className="text-fg text-[11px] font-semibold tracking-wide uppercase">
              Platform Access
            </p>
            <ul className="space-y-2">
              <li>
                <Link href="/demo/demo-brand" className="hover:text-fg transition-colors">
                  Launch Demo Brand
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-fg transition-colors">
                  Sign in
                </Link>
              </li>
              <li>
                <Link href="/onboarding" className="hover:text-fg transition-colors">
                  Set up new business
                </Link>
              </li>
              <li>
                <a href="#simulator" className="hover:text-fg transition-colors">
                  Interactive Sandbox
                </a>
              </li>
              <li>
                <span className="text-subtle">Supabase RLS Policy Guard</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-border-subtle text-subtle mt-12 flex flex-col items-center justify-between gap-4 border-t pt-6 text-xs sm:flex-row">
          <p>© {new Date().getFullYear()} D2C Business OS · Licensed under Monorepo Spec.</p>
          <div className="flex items-center gap-5">
            <span>Row-Level Security Active</span>
            <span>·</span>
            <span>Nx Monorepo Enforced</span>
            <span>·</span>
            <span>Postiz API Adapter</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
