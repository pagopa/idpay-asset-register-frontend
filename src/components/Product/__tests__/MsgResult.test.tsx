import { render, screen } from '@testing-library/react';
import MsgResult from '../MsgResult';
import '@testing-library/jest-dom';

describe('MsgResult', () => {
  it('renderizza il messaggio senza errori', () => {
    render(<MsgResult message="Test message" />);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });
});
