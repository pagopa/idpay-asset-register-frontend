import { render, screen, fireEvent } from '@testing-library/react';
import MessagePage from '../MessagePage';
import '@testing-library/jest-dom';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('../../../pages/components/EmptyList', () => (props: any) => (
  <div data-testid="empty-list">{props.message}</div>
));

describe('MessagePage', () => {
  it('renderizza il messaggio e non mostra il bottone se goBack è false', () => {
    render(<MessagePage message="Nessun prodotto" goBack={false}/>);
    expect(screen.getByTestId('empty-list')).toHaveTextContent('Nessun prodotto');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renderizza il messaggio e mostra il bottone se goBack è true', () => {
    render(<MessagePage message="Nessun prodotto" goBack={true}/>);
    expect(screen.getByTestId('empty-list')).toHaveTextContent('Nessun prodotto');
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('pages.products.backToTable');
  });

  it('chiama onGoBack quando il bottone viene cliccato', () => {
    const onGoBack = jest.fn();
    render(<MessagePage message="Messaggio" goBack={true} onGoBack={onGoBack}/>);
    fireEvent.click(screen.getByRole('button'));
    expect(onGoBack).toHaveBeenCalledTimes(1);
  });
})