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

describe('filtersRender.text', () => {
  it('handles onChange with valid value (no error)', () => {
    const setFilters = jest.fn();
    const setErrors = jest.fn();

    render(
      filtersRender.text({
        item: {
          id: 'code',
          labelKey: 'code.label',
          regEx: '^[A-Z]+$',
        },
        t: t as any,
        filters: {},
        setFilters,
        setErrors,
        errors: [],
      } as any)
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'ABC' } });

    expect(setFilters).toHaveBeenCalledWith('code', { value: 'ABC' });
    expect(setErrors).toHaveBeenCalledWith('code', false);
  });

  it('handles onChange with invalid value (sets error)', () => {
    const setFilters = jest.fn();
    const setErrors = jest.fn();

    render(
      filtersRender.text({
        item: {
          id: 'code',
          labelKey: 'code.label',
          regEx: '^[A-Z]+$',
          message: 'error.message',
        },
        t: t as any,
      filters: {},
        setFilters,
        setErrors,
        errors: ['code'],
      } as any)
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'abc' } });

    expect(setFilters).toHaveBeenCalled();
    expect(setErrors).toHaveBeenCalledWith('code', true);
  });

  it('handles onPaste and strips spaces before validation', () => {
    const setFilters = jest.fn();
    const setErrors = jest.fn();

    render(
      filtersRender.text({
        item: {
          id: 'code',
          labelKey: 'code.label',
          regEx: '^[A-Z]+$',
        },
        t: t as any,
        filters: {},
        setFilters,
        setErrors,
        errors: [],
      } as any)
    );

    const input = screen.getByRole('textbox');

    fireEvent.paste(input, {
      clipboardData: {
        getData: () => 'A B C',
      },
      preventDefault: jest.fn(),
    });

    expect(setFilters).toHaveBeenCalledWith('code', { value: 'ABC' });
    expect(setErrors).toHaveBeenCalledWith('code', false);
  });
});
