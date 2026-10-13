import type { Meta, StoryObj } from "@storybook/react-vite";

import { Input } from "./input";

const meta = {
  title: "Primitives/Input",
  component: Input,
  args: { placeholder: "Enter brand domain or handle..." },
  argTypes: {
    inputSize: { control: "select", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Small: Story = { args: { inputSize: "sm", placeholder: "Quick search..." } };
export const Large: Story = { args: { inputSize: "lg", placeholder: "you@brand.in" } };
export const Disabled: Story = { args: { disabled: true, value: "locked-brand-slug" } };
