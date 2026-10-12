import { SAMPLE_FESTIVALS } from "@ap/social-domain";
import { FestivalList, PostCard } from "@ap/social-frontend";
import { Button } from "@ap/ui";

export const metadata = { title: "Social" };

// TODO: fetch posts from social-api via src/lib/api.ts
const demoPosts = [
  {
    caption: "Navratri chaniya choli collection drops tonight ✨ #Navratri #Garba",
    format: "reel" as const,
    platforms: ["instagram" as const, "facebook" as const],
    status: "scheduled" as const,
    scheduledAt: "2026-10-20T13:30:00.000Z",
  },
  {
    caption: "Diwali gifting guide: 10 handpicked hampers under ₹999",
    format: "carousel" as const,
    platforms: ["instagram" as const],
    status: "pending_approval" as const,
    scheduledAt: null,
  },
];

export default function SocialPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Social</h1>
        <Button>Generate 30-day plan</Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-wrap gap-4">
          {demoPosts.map((p) => (
            <PostCard key={p.caption} post={p} />
          ))}
        </div>
        <FestivalList festivals={SAMPLE_FESTIVALS} region="IN-GJ" from={new Date("2026-10-12")} />
      </div>
    </div>
  );
}
