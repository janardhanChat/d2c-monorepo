"use client";

import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ap/ui";
import Link from "next/link";
import { useState } from "react";

const plans = [
  {
    id: "free",
    name: "Community / Free",
    description: "Ideal for solo builders experimenting with automation",
    monthlyPrice: "$0",
    annualPrice: "$0",
    period: "forever free",
    badge: null,
    popular: false,
    features: [
      "1 Brand workspace",
      "30 Scheduled posts / mo",
      "Instagram & Facebook publishing",
      "Basic festival calendar alerts",
      "In-memory local dev support",
    ],
    cta: "Start Free",
    ctaVariant: "outline" as const,
  },
  {
    id: "starter",
    name: "Starter",
    description: "For growing D2C brands publishing consistently",
    monthlyPrice: "$29",
    annualPrice: "$24",
    period: "per brand / month",
    badge: null,
    popular: false,
    features: [
      "Up to 3 Brands",
      "Unlimited scheduled posts",
      "FastAPI AI caption generator",
      "Draft → Approval workflows",
      "Multi-channel analytics (Postiz)",
      "Standard email support",
    ],
    cta: "Choose Starter",
    ctaVariant: "secondary" as const,
  },
  {
    id: "growth",
    name: "Growth OS",
    description: "For high-velocity D2C brands automating social & commerce",
    monthlyPrice: "$79",
    annualPrice: "$64",
    period: "per brand / month",
    badge: "Most Popular",
    popular: true,
    features: [
      "Unlimited Brands & Teams",
      "Advanced 30-Day Content AI Studio",
      "Transactional Outbox Webhook Relay",
      "Full 4-tier granular RBAC",
      "Omnichannel Commerce sync (Beta)",
      "Dedicated WhatsApp channel bridge",
    ],
    cta: "Get Started with Growth",
    ctaVariant: "glow" as const,
  },
  {
    id: "pro",
    name: "Enterprise",
    description: "For established retail conglomerates and agencies",
    monthlyPrice: "$249",
    annualPrice: "$199",
    period: "billed custom",
    badge: "Scale",
    popular: false,
    features: [
      "Self-hosted Supabase cluster support",
      "Custom Traefik reverse proxy routing",
      "Custom third-party connectors",
      "99.95% SLA & dedicated account manager",
      "Audit logging & compliance exports",
      "Direct engineer onboarding",
    ],
    cta: "Contact Architecture Team",
    ctaVariant: "outline" as const,
  },
];

export function PricingPlans() {
  const [annualBilling, setAnnualBilling] = useState(true);

  return (
    <div className="space-y-8">
      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center gap-3">
        <span
          className={`text-sm font-medium ${
            !annualBilling ? "text-fg" : "text-muted"
          } cursor-pointer`}
          onClick={() => setAnnualBilling(false)}
        >
          Monthly billing
        </span>
        <button
          type="button"
          onClick={() => setAnnualBilling((v) => !v)}
          className={`relative h-7 w-12 cursor-pointer rounded-full p-1 transition-colors ${
            annualBilling ? "bg-primary" : "bg-surface-2 border-border border"
          }`}
          aria-label="Toggle annual or monthly billing"
        >
          <div
            className={`h-5 w-5 rounded-full bg-white transition-transform ${
              annualBilling ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
        <span
          className={`flex items-center gap-1.5 text-sm font-medium ${
            annualBilling ? "text-fg" : "text-muted"
          } cursor-pointer`}
          onClick={() => setAnnualBilling(true)}
        >
          Annual billing
          <Badge tone="success" className="px-1.5 py-0 text-[10px]">
            Save 20%
          </Badge>
        </span>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid gap-6 lg:grid-cols-4">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            variant={plan.popular ? "gradient" : "default"}
            className={`relative flex flex-col justify-between transition-all duration-300 hover:shadow-xl ${
              plan.popular
                ? "border-primary/60 ring-primary/40 shadow-primary/10 shadow-lg ring-2"
                : ""
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge tone="brand" className="px-3 py-1 text-xs shadow-md">
                  {plan.badge}
                </Badge>
              </div>
            )}

            <div>
              <CardHeader className="pt-2">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <CardDescription className="min-h-[32px] text-xs">
                  {plan.description}
                </CardDescription>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-fg text-3xl font-extrabold tracking-tight">
                    {annualBilling ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-muted text-xs">/{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="border-border-subtle mt-4 border-t pt-4">
                <ul className="text-muted space-y-2.5 text-xs">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <svg
                        className="text-success h-4 w-4 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </div>

            <div className="border-border-subtle mt-6 border-t pt-4">
              <Link href="/onboarding" className="block w-full">
                <Button variant={plan.ctaVariant} className="w-full text-xs">
                  {plan.cta}
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
