import { ThemeProvider } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import { render } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { createStore } from '../../redux/store';

export const renderWithContext = (
    element?: React.ReactNode,
    injectedStore?: ReturnType<typeof createStore>,
    initialEntries: string[] = ['/']
) => {
    const store = injectedStore ?? createStore();

    return {
        ...render(
            <ThemeProvider theme={theme}>
                <MemoryRouter initialEntries={initialEntries}>
                    <Provider store={store}>{element}</Provider>
                </MemoryRouter>
            </ThemeProvider>
        ),
        store,
    };
};
