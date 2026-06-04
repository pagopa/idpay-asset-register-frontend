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
});
