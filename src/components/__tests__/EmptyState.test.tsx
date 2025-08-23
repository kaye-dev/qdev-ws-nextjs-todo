import { render, screen } from '@testing-library/react'
import EmptyState from '../EmptyState'

describe('EmptyState Component', () => {
  it('should render empty state message', () => {
    render(<EmptyState />)

    expect(screen.getByText('タスクがありません')).toBeInTheDocument()
    expect(screen.getByText('上のフォームから新しいタスクを追加して、やるべきことを管理しましょう。')).toBeInTheDocument()
  })

  it('should render keyboard shortcut hint', () => {
    render(<EmptyState />)

    expect(screen.getByText('Enterキーでも追加できます')).toBeInTheDocument()
  })

  it('should have proper accessibility attributes', () => {
    render(<EmptyState />)

    const container = screen.getByRole('status')
    expect(container).toHaveAttribute('aria-live', 'polite')
  })

  it('should render clipboard icon', () => {
    render(<EmptyState />)

    const svg = screen.getByRole('status').querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })
})
