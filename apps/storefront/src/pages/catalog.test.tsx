// apps/storefront/src/pages/catalog.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Catalog from './catalog'

// Mock the API calls
vi.mock('../lib/api', () => ({
  listProducts: () => Promise.resolve([
    { id: 'P1', title: 'Test Product 1', price: 10.99, image: 'test1.jpg', tags: ['test'], stockQty: 5 },
    { id: 'P2', title: 'Test Product 2', price: 20.99, image: 'test2.jpg', tags: ['test'], stockQty: 3 },
  ])
}))

describe('Catalog Page', () => {
  it('renders products in a grid', async () => {
    render(
      <MemoryRouter>
        <Catalog />
      </MemoryRouter>
    )

    // Wait for products to load
    const product1 = await screen.findByText('Test Product 1')
    const product2 = await screen.findByText('Test Product 2')

    expect(product1).toBeInTheDocument()
    expect(product2).toBeInTheDocument()
  })

  it('allows searching products', async () => {
    render(
      <MemoryRouter>
        <Catalog />
      </MemoryRouter>
    )

    await screen.findByText('Test Product 1') // data loaded

    const user = userEvent.setup()
    const search = screen.getByPlaceholderText('Search...')

    await user.clear(search)
    await user.type(search, 'Product 2')

    // Wait for filtering to apply (if debounced/stateful)
    await waitFor(() => expect(screen.getByText('Test Product 2')).toBeInTheDocument())
    // When something disappears, assert not-in-document (not .toBeVisible on null)
    expect(screen.queryByText('Test Product 1')).not.toBeInTheDocument()
  })

  it('allows sorting products by price', async () => {
    render(
      <MemoryRouter>
        <Catalog />
      </MemoryRouter>
    )

    await screen.findByText('Test Product 1') // data loaded

    const sortSelect = screen.getByRole('combobox')
    // High → low
    fireEvent.change(sortSelect, { target: { value: 'desc' } })

    // Query prices directly (no test ids in the current DOM)
    const prices = await screen.findAllByText(/^\$\d+\.\d{2}$/)

    // For descending, first should be $20.99 then $10.99
    expect(prices[0]).toHaveTextContent('$20.99')
    expect(prices[1]).toHaveTextContent('$10.99')
  })

  it('allows filtering products by tag', async () => {
    render(
      <MemoryRouter>
        <Catalog />
      </MemoryRouter>
    )

    await screen.findByText('Test Product 1')

    const tagFilter = screen.getByRole('button', { name: /test/i })
    fireEvent.click(tagFilter)

    expect(screen.getByText('Test Product 1')).toBeVisible()
    expect(screen.getByText('Test Product 2')).toBeVisible()
  })
})
