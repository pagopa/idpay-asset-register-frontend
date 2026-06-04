/// <reference types="jest" />
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { filtersRender } from '../filtersRender';

jest.mock('../../../helpers', () => ({
  filterInputWithSpaceRule: jest.fn((v: string) => v.replace(/\s/g, '')),
}));

const t = (k: string) => k;

describe('filtersRender - select', () => {
  it('renders select options and handles change with labelKey', () => {
    // covers renderValue branch
    const filters = { status: { value: 'A', label: 'label.A' } };
    const setFilters = jest.fn();

    const template = {
      A: { labelKey: 'label.A', label: 'label.A' },
      B: { label: 'Label B', color: 'primary' as any },
    };

    const element = filtersRender.select({
      item: { id: 'status', labelKey: 'status.label' },
      t: t as any,
      filters,
      setFilters,
      setErrors: jest.fn(),
      template,
    });

    render(element);

    // directly trigger onChange instead of relying on MUI internal button role
    const select = screen.getByLabelText('status.label');
    fireEvent.change(select, { target: { value: 'A' } });

    expect(setFilters).toHaveBeenCalledWith('status', {
      value: 'A',
      label: 'label.A',
    });
  });
});

describe('filtersRender - text', () => {
  it('handles valid regex input', () => {
    // covers helperText branch false
    const setFilters = jest.fn();
    const setErrors = jest.fn();

    const element = filtersRender.text({
      item: {
        id: 'code',
        labelKey: 'code.label',
        regEx: '^[0-9]+$',
        message: 'error.msg',
      },
      t: t as any,
      filters: {},
      setFilters,
      setErrors,
    } as any);

    render(element);

    const input = screen.getByLabelText('code.label');
    fireEvent.change(input, { target: { value: '123' } });

    expect(setFilters).toHaveBeenCalledWith('code', { value: '123' });
    expect(setErrors).toHaveBeenCalledWith('code', false);
  });

  it('handles invalid regex input', () => {
    // covers helperText branch true
    const setFilters = jest.fn();
    const setErrors = jest.fn();

    const element = filtersRender.text({
      item: {
        id: 'code',
        labelKey: 'code.label',
        regEx: '^[0-9]+$',
        message: 'error.msg',
      },
      t: t as any,
      filters: {},
      setFilters,
      setErrors,
      errors: ['code'],
    } as any);

    render(element);

    const input = screen.getByLabelText('code.label');
    fireEvent.change(input, { target: { value: 'abc' } });

    expect(setErrors).toHaveBeenCalledWith('code', true);
  });

  it('handles paste removing spaces', () => {
    // covers onPaste branch and space removal
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

    render(element);

    const input = screen.getByLabelText('code.label');

    fireEvent.paste(input, {
      clipboardData: {
        getData: () => '1 2 3',
      },
    });

    expect(setFilters).toHaveBeenCalledWith('code', { value: '123' });
  });
});
