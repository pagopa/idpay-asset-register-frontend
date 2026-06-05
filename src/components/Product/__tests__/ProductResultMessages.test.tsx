import { render, screen } from '@testing-library/react';
import ProductResultMessages from '../ProductResultMessages';

jest.mock('../../../hooks/useScopedTranslation', () => ({
  __esModule: true,
  default: () => ({ t: (k: string) => `t:${k}` }),
}));

jest.mock('../MsgResult', () => ({
  __esModule: true,
  default: ({ severity, message, bottom }: any) => (
    <div data-testid="msg-result">
      {severity}:{message}:{bottom}
    </div>
  ),
}));

const t = (key: string) => `t:${key}`;
const getMsgResultByActionType = jest.fn((_t, actionType) => `msg:${actionType}`);

const baseProps = {
  showMsgWaitApproved: false,
  showMsgSupervised: false,
  showMsgApproved: false,
  showMsgAcceptApprovation: false,
  showMsgRejected: false,
  showMsgRejectedApprovation: false,
  showMixStatusError: false,
  showYourselfApprovedError: false,
  showGenericError: false,
  t,
  getMsgResultByActionType,
  bottom: 80,
};

describe('ProductResultMessages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getMsgResultByActionType.mockImplementation((_t, actionType) => `msg:${actionType}`);
  });

  it('renders nothing when all flags are false', () => {
    render(<ProductResultMessages {...baseProps} />);

    expect(screen.queryByTestId('msg-result')).not.toBeInTheDocument();
  });

  it('renders every success and error message branch', () => {
    render(
      <ProductResultMessages
        {...baseProps}
        showMsgWaitApproved
        showMsgSupervised
        showMsgApproved
        showMsgAcceptApprovation
        showMsgRejected
        showMsgRejectedApprovation
        showMixStatusError
        showYourselfApprovedError
      />
    );

    expect(screen.getAllByTestId('msg-result')).toHaveLength(8);
    expect(screen.getAllByText(/success:msg:/)).toHaveLength(6);
    expect(screen.getByText('error:t:msgResutlt.errorMixSelected:80')).toBeInTheDocument();
    expect(screen.getByText('error:t:msgResutlt.errorYourselfApproved:80')).toBeInTheDocument();
    expect(getMsgResultByActionType).toHaveBeenCalledTimes(6);
  });
});
