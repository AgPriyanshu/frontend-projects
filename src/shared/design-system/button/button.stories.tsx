import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    children: "Button",
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    colorScheme: "blue",
  },
};

export const Sizes: Story = {
  render: () => (
    <>
      <Button size="xs" mr={2}>
        XS
      </Button>
      <Button size="sm" mr={2}>
        SM
      </Button>
      <Button size="md" mr={2}>
        MD
      </Button>
      <Button size="lg">LG</Button>
    </>
  ),
};
