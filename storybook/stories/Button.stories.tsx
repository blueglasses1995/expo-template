import type { Meta, StoryObj } from '@storybook/react-native'
import { Button } from 'tamagui'

const meta: Meta<typeof Button> = {
  title: 'Tamagui/Button',
  component: Button,
}

export default meta

type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: {
    children: 'Press me',
  },
}

export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outlined',
  },
}

