import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { OptionalLink } from './OptionalLink';

describe('OptionalLink', () => {
  it.each(['http://example.com', 'https://example.com'])(
    'renders a link for URL %s',
    (value) => {
      render(<OptionalLink value={value} />);

      expect(screen.getByRole('link')).toHaveAttribute('href', value);
      expect(screen.getByRole('link')).toHaveTextContent(value);
    }
  );

  it('adds https when a URL has no protocol', () => {
    render(<OptionalLink value="example.com" />);

    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://example.com');
  });

  it('renders plain text without an anchor for non-URL values', () => {
    render(<OptionalLink value="Nessuna" />);

    expect(screen.getByText('Nessuna')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('trims whitespace before evaluating the value', () => {
    render(<OptionalLink value="   https://example.com   " />);

    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://example.com');
    expect(screen.getByRole('link')).toHaveTextContent('https://example.com');
  });

  it('renders the missing-data placeholder for an undefined value', () => {
    render(<OptionalLink />);

    expect(screen.getByText('-')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});