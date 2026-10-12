import { Card, CardDescription, CardTitle } from "@ap/ui";

import { products } from "@/products";

export const metadata = { title: "Automations" };

/** Builder options come from each product's manifest (triggers + actions). */
export default function AutomationsPage() {
  const triggers = products.flatMap((p) => p.automation?.triggers ?? []);
  const actions = products.flatMap((p) => p.automation?.actions ?? []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Automations</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardTitle>Triggers</CardTitle>
          <CardDescription>What starts an automation</CardDescription>
          <ul className="mt-3 list-disc pl-5 text-sm">
            {triggers.map((t) => (
              <li key={t.id}>{t.label}</li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardTitle>Actions</CardTitle>
          <CardDescription>What it does</CardDescription>
          <ul className="mt-3 list-disc pl-5 text-sm">
            {actions.map((a) => (
              <li key={a.id}>{a.label}</li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
