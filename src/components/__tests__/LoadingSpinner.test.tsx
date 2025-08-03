import React from 'react'
import { render, screen } from '@testing-library/react'
import LoadingSpinner from '../LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toBeInTheDocument()
  })

  it('renders with custom size', () => {
    render(<LoadingSpinner size="lg" />)
    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toHaveClass('w-8', 'h-8')
  })

  it('renders with custom color', () => {
    render(<LoadingSpinner color="secondary" />)
    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toHaveClass('border-neon-green/30', 'border-t-neon-green')
  })

  it('renders with custom className', () => {
    render(<LoadingSpinner className="custom-class" />)
    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toHaveClass('custom-class')
  })
}) 