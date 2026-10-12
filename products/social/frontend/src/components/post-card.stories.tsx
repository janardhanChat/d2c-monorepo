import type { Meta, StoryObj } from "@storybook/react-vite";

import { PostCard } from "./post-card";

const meta = {
  title: "Social/PostCard",
  component: PostCard,
  args: {
    post: {
      caption: "Navratri chaniya choli collection drops tonight at 7 PM ✨ #Navratri #Garba",
      format: "reel",
      platforms: ["instagram", "facebook"],
      status: "scheduled",
      scheduledAt: "2026-10-20T13:30:00.000Z",
    },
  },
} satisfies Meta<typeof PostCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scheduled: Story = {};
export const PendingApproval: Story = {
  args: { post: { ...meta.args.post, status: "pending_approval", scheduledAt: null } },
};
export const Failed: Story = { args: { post: { ...meta.args.post, status: "failed" } } };
