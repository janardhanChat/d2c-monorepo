import { upcomingFestivals, type Festival } from "@ap/social-domain";
import { Card, CardDescription, CardTitle } from "@ap/ui";

export function FestivalList({
  festivals,
  region,
  from,
}: {
  festivals: Festival[];
  region: string;
  from: Date;
}) {
  const list = upcomingFestivals(festivals, { region, from, days: 120 });
  return (
    <Card className="self-start">
      <CardTitle>Upcoming festivals</CardTitle>
      <CardDescription>Plan content before the rush</CardDescription>
      <ul className="mt-4 space-y-2 text-sm">
        {list.map((f) => (
          <li key={f.id} className="flex justify-between">
            <span>{f.name}</span>
            <span className="text-muted">{f.date}</span>
          </li>
        ))}
        {list.length === 0 && <li className="text-muted">Nothing in the next 120 days</li>}
      </ul>
    </Card>
  );
}
