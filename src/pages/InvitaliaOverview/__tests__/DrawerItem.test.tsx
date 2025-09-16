import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DrawerItem from '../DrawerItem';

describe('DrawerItem', () => {
  const itemHeader = 'Header';
  const itemValue = 'Value';

  it('renders itemHeader and itemValue', () => {
    render(<DrawerItem itemHeader={itemHeader} itemValue={itemValue} />);
    expect(screen.getByText(itemHeader)).toBeTruthy();
    expect(screen.getByText(itemValue)).toBeTruthy();
  });

  it('does not render copy icon if copyable is false', () => {
    render(<DrawerItem itemHeader={itemHeader} itemValue={itemValue} />);
    expect(screen.queryByTestId('ContentCopyIcon')).toBeNull();
  });

  it('renders copy icon if copyable is true', () => {
    render(<DrawerItem itemHeader={itemHeader} itemValue={itemValue} copyable />);
    expect(screen.getByTestId('ContentCopyIcon')).toBeTruthy();
  });

  it('calls clipboard.writeText when copy icon is clicked', async () => {
    const writeTextMock = jest.fn();
    // @ts-ignore
    global.navigator.clipboard = { writeText: writeTextMock };

    render(<DrawerItem itemHeader={itemHeader} itemValue={itemValue} copyable />);
    const icon = screen.getByTestId('ContentCopyIcon');
    fireEvent.click(icon);
    expect(writeTextMock).toHaveBeenCalledWith(itemValue);
  });
});
