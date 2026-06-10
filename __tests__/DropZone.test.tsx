import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DropZone from '@/components/ui/DropZone';

describe('DropZone Component', () => {
  it('renders the upload prompt', () => {
    const mockFn = vi.fn();
    render(React.createElement(DropZone, { onFileHashed: mockFn }));
    expect(screen.getByText(/drag & drop/i)).toBeDefined();
  });

  it('shows privacy notice', () => {
    const mockFn = vi.fn();
    render(React.createElement(DropZone, { onFileHashed: mockFn }));
    expect(screen.getAllByText(/never uploaded/i).length).toBeGreaterThan(0);
  });

  it('applies disabled styles when disabled', () => {
    const mockFn = vi.fn();
    const { container } = render(React.createElement(DropZone, { onFileHashed: mockFn, disabled: true }));
    const dropzone = container.querySelector('.drop-zone');
    expect(dropzone?.className).toContain('cursor-not-allowed');
  });
});
