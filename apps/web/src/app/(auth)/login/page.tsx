import { Button, Card, CardDescription, CardTitle } from "@ap/ui";

export const metadata = { title: "Sign in" };

// TODO: wire to Supabase Auth (GoTrue) via src/lib/supabase/browser.ts
export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <Card className="w-full max-w-sm space-y-4">
        <div>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Use your work email to continue</CardDescription>
        </div>
        <input
          type="email"
          placeholder="you@brand.in"
          className="border-border bg-surface-2 w-full rounded-lg border px-3 py-2 text-sm"
        />
        <Button className="w-full">Send magic link</Button>
      </Card>
    </main>
  );
}
