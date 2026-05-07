import { downloadCsv } from '../helpers';

describe('downloadCsv', () => {
  const originalCreateObjectURL = global.URL.createObjectURL;
  const originalRevokeObjectURL = global.URL.revokeObjectURL;
  const originalCreateElement = document.createElement;
  const originalAppendChild = document.body.appendChild;
  const originalRemoveChild = document.body.removeChild;

  const setupDownloadMocks = () => {
    const mockClick = jest.fn();
    const mockAnchor = {
      click: mockClick,
      href: '',
      download: '',
    };

    global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/fake-url');
    global.URL.revokeObjectURL = jest.fn();
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
    jest.spyOn(document, 'createElement').mockImplementation(() => mockAnchor as any);

    return { mockAnchor, mockClick };
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
    global.URL.createObjectURL = originalCreateObjectURL;
    global.URL.revokeObjectURL = originalRevokeObjectURL;
    document.createElement = originalCreateElement;
    document.body.appendChild = originalAppendChild;
    document.body.removeChild = originalRemoveChild;
  });

  it('should create a blob with BOM and trigger download with correct filename', () => {
    const { mockAnchor, mockClick } = setupDownloadMocks();
    const csvContent = { data: 'col1,col2\nval1,val2' };
    const filename = 'test.csv';

    downloadCsv(csvContent, filename);

    expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(document.body.appendChild).toHaveBeenCalledWith(mockAnchor);
    expect(mockAnchor.href).toBe('blob:http://localhost/fake-url');
    expect(mockAnchor.download).toBe(filename);
    expect(mockClick).toHaveBeenCalled();
  });

  it.each([
    ['plain string content', 'a,b\n1,2'],
    ['response string content', { response: 'a,b\n1,2' }],
    ['nested response data content', { response: { data: 'a,b\n1,2' } }],
    ['body string content', { body: 'a,b\n1,2' }],
    ['nested body data content', { body: { data: 'a,b\n1,2' } }],
  ])('supports %s', (_description, content) => {
    const { mockClick } = setupDownloadMocks();

    downloadCsv(content as any, 'report.csv');

    expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(mockClick).toHaveBeenCalled();
  });

  it('falls back to report.csv when filename is empty', () => {
    const { mockAnchor } = setupDownloadMocks();

    downloadCsv('a,b\n1,2', '');

    expect(mockAnchor.download).toBe('report.csv');
  });

  it('warns and still downloads an empty csv when content is missing', () => {
    setupDownloadMocks();
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    downloadCsv(undefined, 'empty.csv');

    expect(warnSpy).toHaveBeenCalledWith(
      'downloadCsv: no CSV content found in provided payload. Payload keys:',
      []
    );
    expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
  });

  it('removes the temporary link and revokes the object url', () => {
    const { mockAnchor } = setupDownloadMocks();

    downloadCsv('a,b\n1,2', 'report.csv');
    jest.runOnlyPendingTimers();

    expect(document.body.removeChild).toHaveBeenCalledWith(mockAnchor);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/fake-url');
  });
});
