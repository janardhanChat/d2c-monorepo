import type { Meta, StoryObj } from "@storybook/react-vite";

import { StatCard } from "./stat-card";

const meta = {
  title: "Cards/StatCard",
  component: StatCard,
  args: {
    label: "Campaign Velocity",
    value: "3.8x",
    change: "+42%",
    changeTone: "success",
    description: "Faster cross-channel post rollouts vs. manual creation",
  },
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Attention: Story = {
  args: {
    label: "Approval Backlog",
    value: "4 Posts",
    change: "Action needed",
    changeTone: "warning",
    description: "Awaiting brand manager approval before scheduling",
  },
};
