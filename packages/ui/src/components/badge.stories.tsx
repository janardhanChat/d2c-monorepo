import type { Meta, StoryObj } from "@storybook/react-vite";

import { Badge } from "./badge";

const meta = {
  title: "Primitives/Badge",
  component: Badge,
  args: { children: "Active" },
  argTypes: {
    tone: {
      control: "select",
      options: ["neutral", "info", "brand", "accent", "success", "warning", "danger"],
    },
    dot: { control: "boolean" },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Brand: Story = { args: { tone: "brand", children: "Multi-tenant", dot: true } };
export const Accent: Story = { args: { tone: "accent", children: "Autonomous AI" } };
export const Success: Story = { args: { tone: "success", children: "Published", dot: true } };
export const Warning: Story = { args: { tone: "warning", children: "Pending Approval" } };
export const Danger: Story = { args: { tone: "danger", children: "Failed" } };
