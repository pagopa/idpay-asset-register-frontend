describe('locale/index – NODE_ENV guard', () => {
  let useMock: jest.Mock;
  let initMock: jest.Mock;
  let addResourceBundleMock: jest.Mock;
  let loadItNamespaceMock: jest.Mock;

  beforeEach(() => {
    jest.resetModules();
    useMock = jest.fn().mockReturnThis();
    initMock = jest.fn().mockResolvedValue(undefined);
    addResourceBundleMock = jest.fn();
    loadItNamespaceMock = jest.fn().mockResolvedValue({});

    jest.doMock('@pagopa/selfcare-common-frontend/lib/locale/locale-utils', () => ({
      __esModule: true,
      default: {
        use: useMock,
        init: initMock,
        addResourceBundle: addResourceBundleMock,
        t: jest.fn((k: string) => k),
        language: 'it',
        options: {},
      },
    }));

    jest.doMock('../multiInitiativeI18n', () => ({
      loadItNamespace: loadItNamespaceMock,
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('exports a defined default value (the i18n singleton)', async () => {
    const { default: i18n } = await import('../index');
    expect(i18n).toBeDefined();
    expect(typeof i18n).toBe('object');
  });

  test('exported instance has a translate function "t"', async () => {
    const { default: i18n } = await import('../index');
    expect(typeof (i18n as any).t).toBe('function');
  });

  test('i18n.use() is NOT called in test environment', async () => {
    await import('../index');
    expect(useMock).not.toHaveBeenCalled();
  });

  test('i18n.init() is NOT called in test environment', async () => {
    await import('../index');
    expect(initMock).not.toHaveBeenCalled();
  });

  test('i18n.addResourceBundle() is NOT called in test environment', async () => {
    await import('../index');
    expect(addResourceBundleMock).not.toHaveBeenCalled();
  });

  test('loadItNamespace() is NOT called in test environment', async () => {
    await import('../index');
    expect(loadItNamespaceMock).not.toHaveBeenCalled();
  });

  test('NODE_ENV is "test" (confirming guards are active)', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
});
