import type { Meta, StoryObj } from "@storybook/react-vite";

import { Badge } from "./badge";
import { Card, CardDescription, CardTitle } from "./card";

const meta = {
  title: "Primitives/Card",
  component: Card,
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ModuleCard: Story = {
  render: () => (
    <Card className="w-72">
      <div className="flex items-center justify-between">
        <CardTitle>Social</CardTitle>
        <Badge tone="success" dot>
          Active
        </Badge>
      </div>
      <CardDescription>Create, publish, analyze</CardDescription>
    </Card>
  ),
};

export const GlassCard: Story = {
  render: () => (
    <Card variant="glass" className="w-80">
      <CardTitle>Glassmorphism Surface</CardTitle>
      <CardDescription>Backdrop blur with subtle border sheen</CardDescription>
    </Card>
  ),
};

export const InteractiveCard: Story = {
  render: () => (
    <Card variant="interactive" className="w-80">
      <div className="flex items-center justify-between">
        <CardTitle>AI Content Studio</CardTitle>
        <Badge tone="brand">Feature</Badge>
      </div>
      <CardDescription>Hover over me to see glow & elevation</CardDescription>
    </Card>
  ),
};
