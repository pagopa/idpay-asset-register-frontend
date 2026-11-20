import { renderHook, waitFor } from '@testing-library/react';
import useScopedTranslation from '../useScopedTranslation';

const mockRawT = jest.fn((key: string, options?: { ns?: string }) =>
  options?.ns === 'default/copy' ? 'default copy value' : key
);

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(() => ({ t: mockRawT })),
}));

jest.mock('../useCurrentInitiative', () => ({
  useCurrentInitiative: () => ({ initiativeId: 'decoder-id' }),
}));

jest.mock('../../locale/multiInitiativeBasePath', () => ({
  getInitiativeFolderName: jest.fn(),
}));

jest.mock('../../locale', () => ({
  __esModule: true,
  default: {
    language: 'it',
    loadNamespaces: jest.fn().mockResolvedValue(undefined),
    getResourceBundle: jest.fn(() => ({ loaded: true })),
  },
}));

const { useTranslation } = require('react-i18next');
const mockI18n = require('../../locale').default;
const mockGetInitiativeFolderName =
  require('../../locale/multiInitiativeBasePath').getInitiativeFolderName;

describe('useScopedTranslation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRawT.mockImplementation((key, options) =>
      options?.ns === 'default/copy' ? 'default copy value' : key
    );
    mockGetInitiativeFolderName.mockReturnValue('bonusDecoder2026');
    useTranslation.mockReturnValue({ t: mockRawT });
    mockI18n.loadNamespaces.mockResolvedValue(undefined);
    mockI18n.getResourceBundle.mockReturnValue({ loaded: true });
  });

  it('loads the default copy namespace and uses it when the initiative copy is missing', async () => {
    const { result } = renderHook(() => useScopedTranslation());

    expect(useTranslation).toHaveBeenCalledWith([
      'common',
      'bonusDecoder2026/copy',
      'bonusDecoder2026/tos',
      'default/copy',
    ]);

    await waitFor(() =>
      expect(mockI18n.loadNamespaces).toHaveBeenCalledWith([
        'common',
        'bonusDecoder2026/copy',
        'default/copy',
      ])
    );

    expect(result.current.t('pages.addProducts.boxAddText')).toBe('default copy value');
  });

  it('uses the default copy namespace when the initiative has no scoped folder', async () => {
    mockGetInitiativeFolderName.mockReturnValue('');

    const { result } = renderHook(() => useScopedTranslation());

    expect(useTranslation).toHaveBeenCalledWith(['common', 'default/copy']);

    await waitFor(() =>
      expect(mockI18n.loadNamespaces).toHaveBeenCalledWith(['common', 'default/copy'])
    );

    expect(result.current.t('pages.addProducts.boxAddText')).toBe('default copy value');
  });
});
