import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ap/ui";

const pillars = [
  {
    id: "social",
    title: "Social Automation Engine",
    status: "active",
    statusLabel: "Live · Ready",
    statusTone: "success" as const,
    description:
      "Plan, draft, approve and publish across Instagram, Facebook & LinkedIn. Integrated with festival calendars and AI caption generation.",
    highlights: [
      "Visual multi-brand content calendar",
      "Draft → Approval → Schedule state machine",
      "Postiz publishing adapter & Meta Graph API",
      "Indian & global festival auto-detection",
    ],
    icon: (
      <svg className="text-primary h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    id: "commerce",
    title: "Omnichannel Commerce",
    status: "beta",
    statusLabel: "Product Manifest Ready",
    statusTone: "brand" as const,
    description:
      "Sync catalog, inventory and price adjustments dynamically across Shopify, WooCommerce, and marketplaces with transactional integrity.",
    highlights: [
      "Real-time multi-store catalog sync",
      "Promotional inventory hold triggers",
      "Zero out-of-stock bounce automations",
      "Standardized order & SKU models",
    ],
    icon: (
      <svg className="text-accent h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
    ),
  },
  {
    id: "crm",
    title: "Smart CRM & WhatsApp",
    status: "soon",
    statusLabel: "Scaffolding Complete",
    statusTone: "info" as const,
    description:
      "Conversational WhatsApp campaigns triggered by marketing events, post-purchase delight flows, and abandoned cart recovery.",
    highlights: [
      "WhatsApp Business API event webhooks",
      "VIP customer segmentation",
      "Automated post-purchase review capture",
      "Cross-channel unified customer timeline",
    ],
    icon: (
      <svg className="text-warning h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    ),
  },
  {
    id: "fulfillment",
    title: "Automated Fulfillment",
    status: "soon",
    statusLabel: "Scaffolding Complete",
    statusTone: "neutral" as const,
    description:
      "Intelligent courier allocation, unified tracking updates, and proactive return-to-origin (RTO) minimization.",
    highlights: [
      "Multi-carrier shipping webhook relay",
      "Automated NDR (Non-delivery report) workflows",
      "Branded tracking link generation",
      "RTO risk scoring using historical data",
    ],
    icon: (
      <svg className="text-muted h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    ),
  },
];

export function ProductMatrix() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {pillars.map((pillar) => (
        <Card
          key={pillar.id}
          variant={pillar.status === "active" ? "gradient" : "default"}
          className={`border-border hover:border-primary/50 flex flex-col justify-between transition-all duration-300 hover:shadow-xl ${
            pillar.status === "active" ? "ring-primary/30 ring-1" : ""
          }`}
        >
          <div>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <div className="bg-surface-2 border-border-subtle rounded-xl border p-3">
                  {pillar.icon}
                </div>
                <Badge tone={pillar.statusTone} dot={pillar.status === "active"}>
                  {pillar.statusLabel}
                </Badge>
              </div>
              <CardTitle className="text-fg mt-4 text-xl">{pillar.title}</CardTitle>
              <CardDescription className="text-muted text-sm leading-relaxed">
                {pillar.description}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="border-border-subtle space-y-2 border-t pt-4">
                <p className="text-fg text-xs font-semibold tracking-wide uppercase">
                  Key Capabilities
                </p>
                <ul className="text-muted space-y-2 text-xs">
                  {pillar.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-center gap-2">
                      <span className="bg-primary h-1.5 w-1.5 rounded-full" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </div>

          <div className="border-border-subtle mt-6 flex items-center justify-between border-t pt-4 text-xs">
            <span className="text-subtle font-mono">Module: @ap/{pillar.id}</span>
            <span className="text-primary cursor-pointer font-medium hover:underline">
              {pillar.status === "active" ? "Explore Module →" : "View Scaffolding →"}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}
