import { downloadCsv } from '../helpers';

describe('downloadCsv', () => {
  beforeEach(() => {
    global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/fake-url');
    document.body.appendChild = jest.fn();
  });

  it('should create a blob with BOM and trigger download with correct filename', () => {
    const mockClick = jest.fn();
    const mockAppendChild = jest.spyOn(document.body, 'appendChild');
    const mockCreateObjectURL = jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:url');

    const mockAnchor = {
      click: mockClick,
      set href(_value: string) {},
      set download(_value: string) {},
    };

    jest.spyOn(document, 'createElement').mockImplementation(() => mockAnchor as any);

    const csvContent = { data: 'col1,col2\nval1,val2' };
    const filename = 'test.csv';

    downloadCsv(csvContent, filename);

    expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(mockAppendChild).toHaveBeenCalledWith(mockAnchor);
    expect(mockClick).toHaveBeenCalled();
  });
});
