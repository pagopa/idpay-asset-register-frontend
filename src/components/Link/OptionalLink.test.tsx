import { fireEvent, render, screen } from '@testing-library/react';
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

  it('recognizes www URLs with a path', () => {
    render(<OptionalLink value="www.example.com/scheda" />);

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://www.example.com/scheda'
    );
  });

  it('recognizes an HTTP URL without a top-level domain', () => {
    render(<OptionalLink value="http://localhost" />);

    expect(screen.getByRole('link')).toHaveAttribute('href', 'http://localhost');
  });

  it('renders plain text without an anchor for non-URL values', () => {
    render(<OptionalLink value="Nessuna" />);

    expect(screen.getByText('Nessuna')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('shows a tooltip for plain text when requested', async () => {
    render(<OptionalLink value="Nessuna" tooltip />);

    fireEvent.mouseOver(screen.getByText('Nessuna'));

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Nessuna');
  });

  it('uses the missing-data placeholder in the tooltip for an empty value', async () => {
    render(<OptionalLink value="" tooltip />);

    fireEvent.mouseOver(screen.getByText('-'));

    expect(await screen.findByRole('tooltip')).toHaveTextContent('-');
  });

  it('does not link unsupported URL schemes', () => {
    render(<OptionalLink value="ftp://example.com" />);

    expect(screen.getByText('ftp://example.com')).toBeInTheDocument();
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