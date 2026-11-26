import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import FiltersDrawer from '../FiltersDrawer';
import * as FiltersRenderModule from '../filtersRender';
import { ThemeProvider } from '@mui/material';
import { theme } from '@pagopa/mui-italia/theme';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

jest.mock('../../../hooks/useScopedTranslation', () => ({
  __esModule: true,
  default: () => ({
    t: (key) => key,
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        'pages.products.filterLabels.filter': 'pages.products.filterLabels.filter',
      };
      return translations[key] || key;
    },
  }),
}));

jest.mock('../../../utils/constants', () => ({
  USERS_TYPES: {
    INVITALIA_L1: 'INVITALIA_L1',
    INVITALIA_L2: 'INVITALIA_L2',
    OTHER: 'OTHER',
  },
}));

const mockInstitutions = [
  { institutionId: 'inst1', description: 'Producer 1' },
  { institutionId: 'inst2', description: 'Producer 2' },
];
jest.mock('../../../redux/slices/invitaliaSlice', () => ({
  institutionListSelector: jest.fn(() => mockInstitutions),
}));

const mockFetchUserFromLocalStorage = jest.fn();
let lastFilterInputArg: string | undefined;
const mockTruncateString = jest.fn((v: string) => v);

jest.mock('../../../helpers', () => ({
  fetchUserFromLocalStorage: () => mockFetchUserFromLocalStorage(),
}));


const createTestStore = (preloadedState: any = {}) =>
  configureStore({
    reducer: (state = preloadedState) => state,
    preloadedState,
  });

const renderWithProviders = (ui: React.ReactElement) => {
  const store = createTestStore({});
  return render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>{ui}</ThemeProvider>
    </Provider>
  );
};

describe('FiltersDrawer Component', () => {
  const mockToggleFiltersDrawer = jest.fn();
  const mockSetFilters = jest.fn();
  const mockSetPage = jest.fn();

  let selectSpy: jest.SpyInstance;
  let textSpy: jest.SpyInstance;

  const defaultProps = {
    open: true,
    toggleFiltersDrawer: mockToggleFiltersDrawer,
    batchFilterItems: {
      'batch-1': { label: 'Batch 1' },
    },
    producerFilterItems: {
      'prod-1': { label: 'Producer 1' },
      'prod-2': { label: 'Producer 2' },
    },
    filters: {},
    setFilters: mockSetFilters,
    setPage: mockSetPage,
    filtersConfig: [{ id: 'producer', type: 'select', labelKey: 'pages.products.filterLabels.producer' }],
    templateConfig: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchUserFromLocalStorage.mockReset();

    selectSpy = jest.spyOn(FiltersRenderModule.filtersRender, 'select').mockImplementation(
      ({ item, t, filters, setFilters, template }: any) => {
        const { id } = item;
        return (
          <select
            data-testid={`${id}-testId`}
            value={filters?.[id]?.value || ''}
            onChange={(e) => {
              const selectedKey = e.target.value;
              if (selectedKey && template?.[selectedKey]) {
                setFilters(id, { 
                  value: selectedKey, 
                  label: t(template[selectedKey].label) 
                });
              } else {
                setFilters(id, { value: '', label: '' });
              }
            }}
          >
            <option value="">Select...</option>
            {template && Object.entries(template).map(([key, value]: [string, any]) => (
              <option key={key} value={key} data-testid={`opt-${key}`}>
                {t(value.label)}
              </option>
            ))}
          </select>
        );
      }
    );

    textSpy = jest.spyOn(FiltersRenderModule.filtersRender, 'text').mockImplementation(
      ({ item, t, filters, setFilters, errors, setErrors }: any) => {
        const { id, regEx, message } = item;
        const isError = !!filters?.[id]?.value && errors?.includes(id);
        return (
          <div data-testid={`wrapper-${id}`}>
            <input
              data-testid={`${id}-testId`}
              type="text"
              value={filters?.[id]?.value || ''}
              onChange={(e) => {
                const inputValue = e.target.value;
                const hasError = !!inputValue && !(RegExp(regEx || '').test(inputValue));
                setFilters(id, { value: inputValue });
                setErrors(id, hasError);
              }}
              onPaste={(e) => {
                e.preventDefault();
                const clipboardText = e.clipboardData.getData('text').replace(/\s+/g, '');
                const hasError = !!clipboardText && !(RegExp(regEx || '').test(clipboardText));
                setFilters(id, { value: clipboardText });
                setErrors(id, hasError);
              }}
            />
            {isError && <span data-testid={`${id}-helper-text`}>{message ? t(message) : ''}</span>}
          </div>
        );
      }
    );
  });

  describe('Component rendering', () => {
    it('should render Component', () => {
      renderWithProviders(<FiltersDrawer {...defaultProps} />);

      expect(screen.getByTestId('detail-drawer')).toBeInTheDocument();
      expect(screen.getAllByText('pages.products.filterLabels.filter')).toHaveLength(2);
    });

    it('should call toggleFiltersDrawer(false) when clicking on close button', () => {
      renderWithProviders(<FiltersDrawer {...defaultProps} />);

      const closeButton = screen.getByTestId('open-detail-button');
      fireEvent.click(closeButton);

      expect(mockToggleFiltersDrawer).toHaveBeenCalledWith(false);
    });

    it('should disable buttons when there are no filters', () => {
      renderWithProviders(<FiltersDrawer {...defaultProps} filters={{}} />);

      expect(screen.getByTestId('send-btn')).toBeDisabled();
      expect(screen.getByTestId('cancel-btn')).toBeDisabled();
    });
  });

  describe('Error handling', () => {
    const textConfigProps = {
      ...defaultProps,
      filtersConfig: [
        { id: 'code', type: 'text', labelKey: 'Label', regEx: '^[0-9]+$', message: 'error' }
      ]
    };

    it('should add error and disable send button', () => {
      renderWithProviders(<FiltersDrawer {...textConfigProps} />);

      const input = screen.getByTestId('code-testId');
      fireEvent.change(input, { target: { value: 'invalidInput' } });

      expect(screen.getByTestId('send-btn')).toBeDisabled();
      expect(screen.getByTestId('code-helper-text')).toBeInTheDocument();
    });

    it('should not duplicate error', () => {
      renderWithProviders(<FiltersDrawer {...textConfigProps} />);

      const input = screen.getByTestId('code-testId');
      fireEvent.change(input, { target: { value: 'A' } });
      fireEvent.change(input, { target: { value: 'AB' } });

      expect(screen.getByTestId('send-btn')).toBeDisabled();
    });

    it('should remove error', () => {
      renderWithProviders(<FiltersDrawer {...textConfigProps} />);

      const input = screen.getByTestId('code-testId');

      fireEvent.change(input, { target: { value: 'INVALID' } });
      expect(screen.getByTestId('send-btn')).toBeDisabled();

      fireEvent.change(input, { target: { value: '123' } });

      expect(screen.getByTestId('send-btn')).not.toBeDisabled();
      expect(screen.queryByTestId('code-helper-text')).not.toBeInTheDocument();
    });
    
  });
  describe('Filters handling', () => {
    it('should add draft filter', async () => {
      renderWithProviders(<FiltersDrawer {...defaultProps} />);

      const select = screen.getByTestId('producer-testId');
      fireEvent.change(select, { target: { value: 'prod-1' } });

      const sendBtn = await screen.findByTestId('send-btn');
      await act(async () => {});
      expect(sendBtn).toBeDisabled();
    });

    it('should clear draft when empty value is added', () => {
      renderWithProviders(<FiltersDrawer {...defaultProps} filters={{ producer: { value: 'prod-1', label: 'Producer 1' } }} />);

      const select = screen.getByTestId('producer-testId');

      fireEvent.change(select, { target: { value: '' } });

      expect(screen.getByTestId('send-btn')).not.toBeDisabled();
      fireEvent.click(screen.getByTestId('send-btn'));
      expect(mockSetFilters).toHaveBeenCalledWith({});
    });

    it('clears only the selected real select and keeps the other applied filter', () => {
      selectSpy.mockRestore();
      renderWithProviders(
        <FiltersDrawer
          {...defaultProps}
          filtersConfig={[
            { id: 'status', type: 'select', labelKey: 'Stato', options: { APPROVED: { label: 'Approvato' } } },
            { id: 'category', type: 'select', labelKey: 'Categoria', options: { SAT: { label: 'Satellitare' } } },
          ]}
          filters={{
            status: { value: 'APPROVED', label: 'Approvato' },
            category: { value: 'SAT', label: 'Satellitare' },
          }}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'common.clearSingleFilter Stato' }));
      expect(mockSetFilters).not.toHaveBeenCalled();
      expect(screen.getByRole('button', { name: 'common.clearSingleFilter Categoria' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'common.clearSingleFilter Stato' })).not.toBeInTheDocument();
      fireEvent.click(screen.getByTestId('send-btn'));
      expect(mockSetFilters).toHaveBeenCalledWith({ category: { value: 'SAT', label: 'Satellitare' } });
    });

    it('restores applied filters and discards validation errors when reopened', () => {
      const props = {
        ...defaultProps,
        filtersConfig: [{ id: 'code', type: 'text', labelKey: 'Codice', regEx: '^[0-9]+$', message: 'error' }],
        filters: { code: { value: '123' } },
      };
      const wrap = (open: boolean) => (
        <Provider store={createTestStore({})}>
          <ThemeProvider theme={theme}><FiltersDrawer {...props} open={open} /></ThemeProvider>
        </Provider>
      );
      const { rerender } = render(wrap(true));
      fireEvent.change(screen.getByTestId('code-testId'), { target: { value: 'invalid' } });
      expect(screen.getByTestId('send-btn')).toBeDisabled();
      rerender(wrap(false));
      rerender(wrap(true));
      expect(screen.getByTestId('code-testId')).toHaveValue('123');
      expect(screen.getByTestId('send-btn')).not.toBeDisabled();
      expect(mockSetFilters).not.toHaveBeenCalled();
    });

    it('should add only new filter keeping safe the others', async () => {
      const multiFilterProps = {
        ...defaultProps,
        filtersConfig: [
          { id: 'producer', type: 'select', labelKey: 'p' },
          { id: 'productFileId', type: 'select', labelKey: 'f' },
        ],
        filters: {
          producer: { value: 'prod-1', label: 'Producer 1' },
          productFileId: { value: 'batch-1', label: 'Batch 1' },
        },
      };

      renderWithProviders(<FiltersDrawer {...multiFilterProps} />);

      const selectProducer = screen.getByTestId('producer-testId');
      fireEvent.change(selectProducer, { target: { value: 'prod-2' } });

      const sendBtn = await screen.findByTestId('send-btn');
      fireEvent.click(sendBtn);

      expect(mockSetFilters).toHaveBeenCalledWith({
        productFileId: { value: 'batch-1', label: 'Batch 1' },
      });
    });
  });

  describe('Paste and cancel handling', () => {
    it('should handle past on input text', () => {
      const textConfigProps = {
        ...defaultProps,
        filtersConfig: [
          { id: 'code', type: 'text', labelKey: 'Label', regEx: '^[0-9]+$' }
        ]
      };
      renderWithProviders(<FiltersDrawer {...textConfigProps} />);

      const input = screen.getByTestId('code-testId');

      const clipboardData = {
        getData: jest.fn().mockReturnValue('12  34')
      };

      fireEvent.paste(input, { clipboardData });

      fireEvent.click(screen.getByTestId('send-btn'));
      expect(mockSetFilters).toHaveBeenCalledWith({
        code: { value: '1234' }
      });
    });

    it('should clear filters and errors when cancel is clicked', () => {
      renderWithProviders(<FiltersDrawer {...defaultProps} filters={{ producer: { value: 'prod-1', label: 'Producer 1' } }} />);

      const cancelBtn = screen.getByTestId('cancel-btn');
      expect(cancelBtn).not.toBeDisabled();

      fireEvent.click(cancelBtn);

      expect(mockSetPage).toHaveBeenCalledWith(0);
      expect(mockToggleFiltersDrawer).toHaveBeenCalledWith(false);
      expect(mockSetFilters).toHaveBeenCalledWith({});
    });
  });
});
