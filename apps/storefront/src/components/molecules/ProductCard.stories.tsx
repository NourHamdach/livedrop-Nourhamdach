import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import ProductCard from './ProductCard'

// If your project uses Tailwind classes, a light wrapper helps the card pop in Storybook.
const withRouterAndPad = (Story: any) => (
  <MemoryRouter>
    <div style={{ padding: 24, background: '#f7f7fb' }}>
      <Story />
    </div>
  </MemoryRouter>
)

const meta: Meta<typeof ProductCard> = {
  title: 'Organisms/ProductCard',
  component: ProductCard,
  decorators: [withRouterAndPad],
  parameters: {
    layout: 'centered',
    controls: { expanded: true },
  },
  args: {
    id: 'P1',
    title: 'Bamboo Travel Mug',
    price: 12.99,
    image: 'https://via.placeholder.com/200x200?text=Product',
    stockQty: 8,
  },
}
export default meta

type Story = StoryObj<typeof ProductCard>

export const Default: Story = {}

export const LowStock: Story = {
  args: { stockQty: 3, title: 'Alpine Running Socks' },
}

export const OutOfStock: Story = {
  args: { stockQty: 0, title: 'Vintage Kettle' },
}

export const LongTitle: Story = {
  args: {
    title:
      'Ultra-Lightweight, Double-Wall, Vacuum-Insulated Stainless Steel Bottle – 750ml — Glacier Blue Edition',
  },
}

/**
 * Demonstrates the “✓ Added” transient state by clicking the Quick add button.
 * Requires @storybook/test (bundled in SB 8) for user interactions.
 */
export const AddedState: Story = {
  args: { title: 'Trail Daypack 20L', stockQty: 10 },
  play: async ({ canvasElement }) => {
    // Avoid relying on internal class names: find the visible button by text.
    const btn = Array.from(
      canvasElement.querySelectorAll('button')
    ).find((b) => /quick add/i.test(b.textContent || ''))
    if (btn) (btn as HTMLButtonElement).click()
  },
}
