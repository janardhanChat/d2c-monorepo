/**
 * Festival calendar model. Real dates move every year (lunar calendar), so production data
 * should come from a maintained source and be stored per year in social.festivals.
 * The entries below are SAMPLE data for development and tests only.
 */
export interface Festival {
  id: string;
  name: string;
  /** ISO date (yyyy-mm-dd) */
  date: string;
  /** "IN" = national; ISO 3166-2 subdivision for regional ones, e.g. "IN-GJ" */
  regions: string[];
  /** Days before the date when content should start going out */
  leadDays: number;
  themes: string[];
}

export const SAMPLE_FESTIVALS: Festival[] = [
  {
    id: "sample-uttarayan",
    name: "Uttarayan",
    date: "2027-01-14",
    regions: ["IN-GJ"],
    leadDays: 5,
    themes: ["kites", "til-gud", "rooftop"],
  },
  {
    id: "sample-diwali",
    name: "Diwali",
    date: "2026-11-08",
    regions: ["IN"],
    leadDays: 14,
    themes: ["lights", "gifting", "sale"],
  },
  {
    id: "sample-republic-day",
    name: "Republic Day",
    date: "2027-01-26",
    regions: ["IN"],
    leadDays: 3,
    themes: ["tricolour", "pride"],
  },
];

/** Festivals relevant to a brand's region within a date window, nearest first. */
export function upcomingFestivals(
  festivals: Festival[],
  opts: { region: string; from: Date; days: number },
): Festival[] {
  const start = opts.from.getTime();
  const end = start + opts.days * 86_400_000;
  return festivals
    .filter((f) => f.regions.includes("IN") || f.regions.includes(opts.region))
    .filter((f) => {
      const t = new Date(f.date).getTime();
      return t >= start && t <= end;
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}
