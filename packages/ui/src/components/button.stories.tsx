import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button";

const meta = {
  title: "Primitives/Button",
  component: Button,
  args: { children: "Generate 30-day plan" },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "outline", "glow", "accent", "ghost", "danger"],
    },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Glow: Story = { args: { variant: "glow", children: "Launch Business OS" } };
export const Accent: Story = { args: { variant: "accent", children: "Automate Workflow" } };
export const Outline: Story = { args: { variant: "outline", children: "View Architecture" } };
export const Secondary: Story = { args: { variant: "secondary", children: "Save draft" } };
export const Danger: Story = { args: { variant: "danger", children: "Disconnect Instagram" } };
export const Disabled: Story = { args: { disabled: true } };
