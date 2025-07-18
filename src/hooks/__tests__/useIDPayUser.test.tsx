import { render } from '@testing-library/react';
import { useIDPayUser } from '../useIDPayUser';
import { useAppSelector } from '../../redux/hooks';

jest.mock('../../redux/hooks');

describe('useIDPayUser', () => {
    const mockUser = {
        id: '123',
        name: 'Mario Rossi',
    };

    beforeEach(() => {
        (useAppSelector as jest.Mock).mockReset();
    });

    it('should return logged user from selector', () => {
        (useAppSelector as jest.Mock).mockReturnValue(mockUser);

        const TestComponent = () => {
            const user = useIDPayUser();
            return <div data-testid="user">{JSON.stringify(user)}</div>;
        };

        const { getByTestId } = render(<TestComponent />);

        expect(getByTestId('user').textContent).toBe(JSON.stringify(mockUser));
    });
});