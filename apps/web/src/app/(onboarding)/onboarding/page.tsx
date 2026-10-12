import { Card, CardDescription, CardTitle } from "@ap/ui";

export const metadata = { title: "Set up your business" };

const steps = [
  { title: "Organization", hint: "Company or agency details" },
  { title: "Brand", hint: "Name, industry, region, language" },
  { title: "Brand profile", hint: "Tone, audience, logo, colours (feeds the AI)" },
  { title: "Connect channels", hint: "Instagram and Facebook" },
  { title: "Choose a plan", hint: "Start free, upgrade anytime" },
];

// TODO: one route per step under (onboarding)/onboarding/<step>, posting to core-api.
export default function OnboardingPage() {
  return (
    <main className="mx-auto max-w-xl space-y-3 p-8">
      <h1 className="mb-6 text-2xl font-semibold">Set up your business</h1>
      {steps.map((s, i) => (
        <Card key={s.title}>
          <CardTitle>
            {i + 1}. {s.title}
          </CardTitle>
          <CardDescription>{s.hint}</CardDescription>
        </Card>
      ))}
    </main>
  );
}
