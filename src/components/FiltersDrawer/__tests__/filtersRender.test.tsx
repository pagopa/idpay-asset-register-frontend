import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { filtersRender } from '../filtersRender';

const t = (k: string) => k;

describe('filtersRender.select', () => {
  it('renders empty string when filter label is undefined (covers renderValue fallback)', () => {
    const setFilters = jest.fn();

    render(
      filtersRender.select({
        item: { id: 'status', labelKey: 'status.label' },
        t: t as any,
        filters: {},
        setFilters,
        setErrors: jest.fn(),
        template: {
          A: { label: 'Option A' },
        },
      } as any)
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();

    // Remove zero‑width space (\u200B) before assertion
    const cleaned = select.textContent?.replace(/\u200B/g, '') ?? '';
    expect(cleaned.trim()).toBe('');
  });

  it('uses template label when selecting option', () => {
    const setFilters = jest.fn();

    render(
      filtersRender.select({
        item: { id: 'status', labelKey: 'status.label' },
        t: t as any,
        filters: {},
        setFilters,
        setErrors: jest.fn(),
        template: {
          A: { label: 'Option A' },
        },
      } as any)
    );

    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('Option A'));

    expect(setFilters).toHaveBeenCalledWith('status', {
      value: 'A',
      label: 'Option A',
    });
  });
});
