import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { renderHook } from '@testing-library/react';
import { initiativeConfigReducer } from '../../redux/slices/initiativeConfigSlice';
import { useInitiativeConfig } from '../useInitiativeConfig';

jest.mock('../useCurrentInitiative', () => ({
  useCurrentInitiative: () => ({
    initiativeName: 'Bonus Decoder',
    startDate: '2026-01-01',
  }),
}));

jest.mock('../useIDPayUser', () => ({
  useIDPayUser: () => ({
    org_role: 'invitalia',
  }),
}));

jest.mock('../../locale/multiInitiativeConfig', () => ({
  loadItInitiativeConfig: jest.fn().mockResolvedValue({
    ui: { tables: { products: { enabled: true } } },
  }),
}));

describe('useInitiativeConfig hook', () => {
  const createStore = () =>
    configureStore({
      reducer: {
        initiativeConfig: initiativeConfigReducer,
      },
    });

  it('returns config from RTK store', async () => {
    const store = createStore();

    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useInitiativeConfig(), { wrapper });

    expect(result.current.loading).toBeDefined();
    expect(result.current.config).toBeDefined();
  });
});
