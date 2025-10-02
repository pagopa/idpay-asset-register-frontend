import {
    genericContainerStyle,
    pagesTableContainerStyle,
    pagesFiltersFormContainerStyle,
} from '../styles';

describe('Style objects', () => {
    test('should match the snapshot', () => {
        expect(genericContainerStyle).toMatchSnapshot();
        expect(pagesTableContainerStyle).toMatchSnapshot();
        expect(pagesFiltersFormContainerStyle).toMatchSnapshot();
    });

    test('genericContainerStyle has correct properties', () => {
        expect(genericContainerStyle).toEqual(
            expect.objectContaining({
                display: 'grid',
                width: '100%',
                gridTemplateColumns: 'repeat(12, 1fr)',
            })
        );
    });

    test('pagesTableContainerStyle has correct properties', () => {
        expect(pagesTableContainerStyle).toEqual(
            expect.objectContaining({
                display: 'grid',
                width: '100%',
                gridTemplateColumns: 'repeat(12, 1fr)',
                alignItems: 'center',
            })
        );
    });

    test('pagesFiltersFormContainerStyle has correct properties', () => {
        expect(pagesFiltersFormContainerStyle).toEqual(
            expect.objectContaining({
                display: 'grid',
                width: '100%',
                gridTemplateColumns: 'repeat(12, 1fr)',
                alignItems: 'baseline',
                gap: 2,
                mb: 4,
            })
        );
    });
});