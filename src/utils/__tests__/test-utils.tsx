import { ThemeProvider } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { createStore } from '../../redux/store';

export const renderWithContext = (
  element?: React.ReactNode,
  injectedStore?: ReturnType<typeof createStore>,
  injectedHistory?: ReturnType<typeof createMemoryHistory>
) => {
  const store = injectedStore ? injectedStore : createStore();
  const history = injectedHistory ? injectedHistory : createMemoryHistory();
  render(
    <ThemeProvider theme={theme}>
      <Router history={history}>
        <Provider store={store}>{element}</Provider>
      </Router>
    </ThemeProvider>
  );
  return { store, history };
};
