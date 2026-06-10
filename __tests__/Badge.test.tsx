import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import Badge from '@/components/ui/Badge';

describe('Badge Component', () => {
  it('renders the label text', () => {
    render(React.createElement(Badge, { label: 'Registered' }));
    expect(screen.getByText('Registered')).toBeDefined();
  });

  it('applies correct colors for known statuses', () => {
    const { container } = render(React.createElement(Badge, { label: 'Active' }));
    const badge = container.querySelector('.status-badge');
    expect(badge?.className).toContain('indigo');
  });

  it('applies fallback colors for unknown statuses', () => {
    const { container } = render(React.createElement(Badge, { label: 'CustomStatus' }));
    const badge = container.querySelector('.status-badge');
    expect(badge?.className).toContain('zinc');
  });

  it('normalizes label case for color lookup', () => {
    const { container } = render(React.createElement(Badge, { label: 'UPHELD' }));
    const badge = container.querySelector('.status-badge');
    expect(badge?.className).toContain('green');
  });
});
