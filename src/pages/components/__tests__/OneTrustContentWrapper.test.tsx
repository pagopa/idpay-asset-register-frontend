import '../__mocks__/pageComponentsCommonMocks';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import OneTrustContentWrapper from '../OneTrustContentWrapper';

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('test suite for OneTrustContentWrapper', () => {
  test('render OneTrustContentWrapper', () => {
    renderWithContext(<OneTrustContentWrapper idSelector={''} isContentLoaded  />);
    expect(document.querySelector('a')).toBeInTheDocument();
  });

  test('renders the notice container', () => {
    renderWithContext(<OneTrustContentWrapper idSelector='' isContentLoaded={false} />);
    expect(document.querySelector('a')).not.toBeInTheDocument();
  });
});
