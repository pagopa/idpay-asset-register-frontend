/// <reference types="jest" />
import React from 'react';
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

  it('renders colored select options and tolerates missing templates', () => {
    const colored = filtersRender.select({
      item: { id: 'status', labelKey: 'status.label' },
      t: t as any,
      filters: {},
      setFilters: jest.fn(),
      setErrors: jest.fn(),
      template: {
        APPROVED: { labelKey: 'approved.label', color: 'success' },
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
    expect(element.props.slotProps.htmlInput).toEqual({ maxLength: 3 });
  });

  it('handles paste', () => {
    const setFilters = jest.fn();

    const element = filtersRender.text({
      item: {
        id: 'code',
        labelKey: 'code.label',
        regEx: '^[0-9]+$',
      },
      t: t as any,
      filters: {},
      setFilters,
      setErrors: jest.fn(),
    } as any);

    element.props.onPaste({
      clipboardData: {
        getData: () => '1 2 3',
      },
      preventDefault: jest.fn(),
    });

    expect(setFilters).toHaveBeenCalledWith('code', { value: undefined });
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
