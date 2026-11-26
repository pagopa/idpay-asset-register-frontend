/// <reference types="jest" />
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { themeNext } from '@pagopa/mui-italia/theme';
import { filtersRender } from '../filtersRender';

jest.mock('../../../helpers', () => ({
  filterInputWithSpaceRule: jest.fn((v: string) => v.replace(/\s/g, '')),
}));

const t = (k: string) => k;

describe('filtersRender - select', () => {
  it('handles select change correctly', () => {
    const setFilters = jest.fn();

    const template = {
      A: { labelKey: 'label.A', label: 'label.A' },
    };

    const element = filtersRender.select({
      item: { id: 'status', labelKey: 'status.label' },
      t: t as any,
      filters: {},
      setFilters,
      setErrors: jest.fn(),
      template,
    });

    element.props.onChange({
      target: { value: 'A' },
      currentTarget: { value: 'A' },
    });

    expect(setFilters).toHaveBeenCalledWith('status', {
      value: 'A',
      label: 'label.A',
    });
  });

  it('uses the plain label fallback when labelKey is missing', () => {
    const setFilters = jest.fn();
    const template = {
      B: { label: 'label.B' },
    };

    const element = filtersRender.select({
      item: { id: 'status' },
      t: t as any,
      filters: { status: { value: 'B', label: 'Selected B' } },
      setFilters,
      setErrors: jest.fn(),
      template,
    });

    expect(element.props.label).toBe('');
    expect(element.props.value).toBe('B');
    expect(element.props.renderValue().props.children).toBe('Selected B');

    element.props.onChange({
      target: { value: 'B' },
    });

    expect(setFilters).toHaveBeenCalledWith('status', {
      value: 'B',
      label: 'label.B',
    });
  });

  it('falls back to empty label when template option has no label information', () => {
    const setFilters = jest.fn();
    const element = filtersRender.select({
      item: { id: 'status' },
      t: t as any,
      filters: {},
      setFilters,
      setErrors: jest.fn(),
      template: {
        UNKNOWN: {} as any,
      },
    });

    element.props.onChange({
      target: { value: 'UNKNOWN' },
    });

    expect(setFilters).toHaveBeenCalledWith('status', {
      value: 'UNKNOWN',
      label: '',
    });
  });

  it('renders colored select options and tolerates missing templates', () => {
    const colored = filtersRender.select({
      item: { id: 'status', labelKey: 'status.label' },
      t: t as any,
      filters: {},
      setFilters: jest.fn(),
      setErrors: jest.fn(),
      template: {
        APPROVED: { label: 'approved.label', color: 'success' },
      },
    });

    expect(colored.props.children[0].props.children.props.color).toBe('success');
    expect(colored.props.children[0].props.children.props.label).toBe('approved.label');

    const empty = filtersRender.select({
      item: { id: 'status', labelKey: 'status.label' },
      t: t as any,
      filters: {},
      setFilters: jest.fn(),
      setErrors: jest.fn(),
    });

    expect(empty.props.children).toEqual([]);
  });

  it('renders plain select options when color is missing', () => {
    const plain = filtersRender.select({
      item: { id: 'status', labelKey: 'status.label' },
      t: t as any,
      filters: {},
      setFilters: jest.fn(),
      setErrors: jest.fn(),
      template: {
        PLAIN: { label: 'plain.label' },
      },
    });

    expect(plain.props.children[0].props.children).toBe('plain.label');
  });

  it('uses the same light colors as product status chips in the status menu', () => {
    const select = filtersRender.select({
      item: { id: 'status' },
      t: t as any,
      filters: {},
      setFilters: jest.fn(),
      setErrors: jest.fn(),
      template: {
        UPLOADED: { label: 'Da esaminare', color: 'default' },
        APPROVED: { label: 'Approvato', color: 'success' },
      },
    });

    render(<ThemeProvider theme={themeNext}>{select}</ThemeProvider>);
    fireEvent.mouseDown(screen.getByRole('combobox'));
    expect(screen.getByText('Da esaminare').closest('.MuiChip-root')).toHaveStyle({ backgroundColor: '#E7ECFC' });
    expect(screen.getByText('Approvato').closest('.MuiChip-root')).toHaveStyle({ backgroundColor: '#E1F4E1' });
  });

  it('clears only the selected value without opening the menu', async () => {
    const setFilters = jest.fn();
    const select = filtersRender.select({
      item: { id: 'status', labelKey: 'status.label' },
      t: t as any,
      filters: { status: { value: 'APPROVED', label: 'Approvato' } },
      setFilters,
      setErrors: jest.fn(),
      template: { APPROVED: { label: 'Approvato', color: 'success' } },
    });
    render(<ThemeProvider theme={themeNext}>{select}</ThemeProvider>);

    const clear = screen.getByRole('button', { name: 'common.clearSingleFilter status.label' });
    await userEvent.click(clear);
    expect(setFilters).toHaveBeenCalledWith('status', { value: '', label: '' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveFocus();

    setFilters.mockClear();
    clear.focus();
    await userEvent.keyboard('{Enter}');
    expect(setFilters).toHaveBeenCalledWith('status', { value: '', label: '' });
  });

  it('does not render a clear button or an empty option for an unselected value', () => {
    const select = filtersRender.select({
      item: { id: 'status' },
      t: t as any,
      filters: {},
      setFilters: jest.fn(),
      setErrors: jest.fn(),
      template: { APPROVED: { label: 'Approvato' } },
    });
    render(<ThemeProvider theme={themeNext}>{select}</ThemeProvider>);
    expect(screen.queryByRole('button', { name: /common.clearSingleFilter/ })).not.toBeInTheDocument();
    fireEvent.mouseDown(screen.getByRole('combobox'));
    expect(screen.getAllByRole('option', { hidden: true })).toHaveLength(1);
  });
});

describe('filtersRender - text', () => {
  it('handles valid input', () => {
    const setFilters = jest.fn();
    const setErrors = jest.fn();

    const element = filtersRender.text({
      item: {
        id: 'code',
        labelKey: 'code.label',
        regEx: '^[0-9]+$',
      },
      t: t as any,
      filters: {},
      setFilters,
      setErrors,
    } as any);

    element.props.onChange({
      target: { value: '123' },
      currentTarget: { value: '123' },
    });

    expect(setFilters).toHaveBeenCalledWith('code', { value: undefined });
    expect(setErrors).toHaveBeenCalledWith('code', false);
  });

  it('handles invalid input', () => {
    const setFilters = jest.fn();
    const setErrors = jest.fn();

    const element = filtersRender.text({
      item: {
        id: 'code',
        labelKey: 'code.label',
        regEx: '^[0-9]+$',
      },
      t: t as any,
      filters: {},
      setFilters,
      setErrors,
    } as any);

    element.props.onChange({
      target: { value: 'abc' },
      currentTarget: { value: 'abc' },
    });

    expect(setErrors).toHaveBeenCalledWith('code', true);
  });

  it('marks text field as invalid and renders helper text', () => {
    const element = filtersRender.text({
      item: {
        id: 'code',
        labelKey: 'code.label',
        regEx: '^[0-9]+$',
        message: 'code.error',
        inputProps: { maxLength: 3 },
      },
      t: t as any,
      filters: { code: { value: 'abc' } },
      errors: ['code'],
      setFilters: jest.fn(),
      setErrors: jest.fn(),
    } as any);

    expect(element.props.error).toBe(true);
    expect(element.props.helperText).toBe('code.error');
    expect(element.props.inputProps).toEqual({ maxLength: 3 });
  });

  it('uses an empty translated label when labelKey is missing', () => {
    const element = filtersRender.text({
      item: {
        id: 'code',
      },
      t: t as any,
      filters: {},
      setFilters: jest.fn(),
      setErrors: jest.fn(),
    } as any);

    expect(element.props.label).toBe('');
  });

  it('handles paste', () => {
    const setFilters = jest.fn();
    const setErrors = jest.fn();
    const preventDefault = jest.fn();

    const element = filtersRender.text({
      item: {
        id: 'code',
        labelKey: 'code.label',
        regEx: '^[0-9]+$',
      },
      t: t as any,
      filters: {},
      setFilters,
      setErrors,
    } as any);

    element.props.onPaste({
      clipboardData: {
        getData: () => '1 2 3',
      },
      preventDefault,
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(setFilters).toHaveBeenCalledWith('code', { value: undefined });
    expect(setErrors).toHaveBeenCalledWith('code', false);
  });

  it('handles invalid pasted values', () => {
    const setErrors = jest.fn();

    const element = filtersRender.text({
      item: {
        id: 'code',
        labelKey: 'code.label',
        regEx: '^[0-9]+$',
      },
      t: t as any,
      filters: {},
      setFilters: jest.fn(),
      setErrors,
    } as any);

    element.props.onPaste({
      clipboardData: {
        getData: () => 'a b c',
      },
      preventDefault: jest.fn(),
    });

    expect(setErrors).toHaveBeenCalledWith('code', true);
  });
});
