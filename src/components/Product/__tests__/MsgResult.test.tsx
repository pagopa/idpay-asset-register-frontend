import { render, screen } from '@testing-library/react';
import { act } from 'react';
import MsgResult from '../MsgResult';
import '@testing-library/jest-dom';

describe('MsgResult', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('renderizza il messaggio senza errori', () => {
    render(<MsgResult message="Test message" />);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('hides the message after the timeout', () => {
    jest.useFakeTimers();

    render(<MsgResult message="Temporary message" />);
    expect(screen.getByText('Temporary message')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(screen.queryByText('Temporary message')).not.toBeInTheDocument();
  });

  it('renders non-success alerts with children', () => {
    render(
      <MsgResult severity="error" variant="filled" message="Error message" bottom={120}>
        <span>Extra details</span>
      </MsgResult>
    );

    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.getByText('Extra details')).toBeInTheDocument();
  });
});
