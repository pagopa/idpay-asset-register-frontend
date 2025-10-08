import InitUploadBox from '../InitUploadBox';
import {renderWithContext} from "../../../utils/__tests__/test-utils";

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('test suite for InitUploadBox', () => {
  test('render InitUploadBox', () => {
    renderWithContext(<InitUploadBox text="text" link="link" />);
  });
});
