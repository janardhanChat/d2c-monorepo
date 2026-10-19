import { Badge, Card, CardDescription, CardTitle, StatCard } from "@ap/ui";

import { products } from "@/products";

export default function BrandHome() {
  return (
    <div className="space-y-6">
      {/* Meta Ads Integration Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-50 via-white to-blue-50/50 p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900">Meta Ads · Marketing Engine</span>
              <Badge tone="success" dot className="px-2.5 py-0.5 text-xs">
                Active & Synced
              </Badge>
            </div>
            <p className="max-w-xl text-xs text-slate-600">
              Connected Page: <strong className="text-slate-900">Official Brand Page</strong> · Meta
              Ad Account: <strong className="text-slate-900">act_492049102830 (INR)</strong>.
              Autonomous bidding and audience syncing are running.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-xs">
              Real-Time ROAS: <span className="font-bold text-emerald-600">4.82x</span>
            </span>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Meta Ad Spend (30d)" value="₹1,42,850" change="+12.4%" />
        <StatCard label="Attributed Revenue" value="₹6,88,537" change="+28.1%" />
        <StatCard label="Cost Per Acquisition" value="₹218" change="-14.2%" changeTone="success" />
        <StatCard label="Campaign Readiness" value="100%" />
      </div>

      {/* Installed Modules */}
      <div>
        <h2 className="mb-3 text-xl font-semibold">Workspace Products</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {products.map((p) => (
            <Card key={p.id}>
              <CardTitle>{p.name}</CardTitle>
              <CardDescription>{p.description}</CardDescription>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
