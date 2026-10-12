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
        <Badge tone="success">Active</Badge>
      </div>
      <CardDescription>Create, publish, analyze</CardDescription>
    </Card>
  ),
};
