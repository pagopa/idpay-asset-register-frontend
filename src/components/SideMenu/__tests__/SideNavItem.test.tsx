import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from '../../../redux/store';
import React from 'react';
import { act } from 'react-dom/test-utils';
import SidenavItem from '../SidenavItem';
import { SvgIcon } from '@mui/material';

describe('Test suite for SideNavItem component', (injectedStore?: ReturnType<
  typeof createStore
>) => {
  const store = injectedStore ? injectedStore : createStore();

  it('renders without crashing', () => {
    window.scrollTo = jest.fn();
  });

  test('Testing rendering of SideMenu component', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <SidenavItem
            handleClick={function (): void {
              //
            }}
            title={''}
            icon={SvgIcon}
            level={0}
          />
        </Provider>
      );
    });
  });
});
