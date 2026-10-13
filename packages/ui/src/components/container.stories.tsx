import type { Meta, StoryObj } from "@storybook/react-vite";

import { Container } from "./container";

const meta = {
  title: "Layout/Container",
  component: Container,
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg", "xl", "full"],
    },
  },
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Container {...args} className="bg-surface border-border rounded-lg border p-6 text-center">
      <p className="text-fg font-medium">Responsive Layout Container</p>
      <p className="text-muted text-sm">Constrains width at breakpoints</p>
    </Container>
  ),
};
