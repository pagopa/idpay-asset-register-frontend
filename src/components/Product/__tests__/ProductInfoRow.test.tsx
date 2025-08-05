import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductInfoRow from '../ProductInfoRow';

describe('ProductInfoRow', () => {
    const defaultProps = {
        label: 'Test Label',
        value: 'Test Value',
    };

    describe('Basic Rendering', () => {
        it('should render with required props only', () => {
            render(<ProductInfoRow {...defaultProps} />);

            expect(screen.getByText('Test Label')).toBeInTheDocument();
            expect(screen.getByText('Test Value')).toBeInTheDocument();
        });

        it('should render ListItem with disablePadding prop', () => {
            render(<ProductInfoRow {...defaultProps} />);

            const listItem = screen.getByRole('listitem');
            expect(listItem).toBeInTheDocument();
        });

        it('should render label and value in correct Typography components', () => {
            render(<ProductInfoRow {...defaultProps} />);

            const labelElement = screen.getByText('Test Label');
            const valueElement = screen.getByText('Test Value');

            expect(labelElement).toBeInTheDocument();
            expect(valueElement).toBeInTheDocument();
        });

        it('should render with empty string values', () => {
            render(<ProductInfoRow label="" value="" />);

            const listItem = screen.getByRole('listitem');
            expect(listItem).toBeInTheDocument();
        });
    });

    describe('Default Props', () => {
        it('should use default labelVariant when not provided', () => {
            render(<ProductInfoRow {...defaultProps} />);

            const labelElement = screen.getByText('Test Label');
            expect(labelElement).toBeInTheDocument();
        });

        it('should use default valueVariant when not provided', () => {
            render(<ProductInfoRow {...defaultProps} />);

            const valueElement = screen.getByText('Test Value');
            expect(valueElement).toBeInTheDocument();
        });

        it('should use empty object as default sx when not provided', () => {
            render(<ProductInfoRow {...defaultProps} />);

            const listItem = screen.getByRole('listitem');
            expect(listItem).toBeInTheDocument();
        });
    });

    describe('Custom Props', () => {
        it('should render with custom labelVariant body1', () => {
            render(<ProductInfoRow {...defaultProps} labelVariant="body1" />);

            const labelElement = screen.getByText('Test Label');
            expect(labelElement).toBeInTheDocument();
        });

        it('should render with custom labelVariant body2', () => {
            render(<ProductInfoRow {...defaultProps} labelVariant="body2" />);

            const labelElement = screen.getByText('Test Label');
            expect(labelElement).toBeInTheDocument();
        });

        it('should render with custom valueVariant body2', () => {
            render(<ProductInfoRow {...defaultProps} valueVariant="body2" />);

            const valueElement = screen.getByText('Test Value');
            expect(valueElement).toBeInTheDocument();
        });

        it('should render with custom valueVariant h6', () => {
            render(<ProductInfoRow {...defaultProps} valueVariant="h6" />);

            const valueElement = screen.getByText('Test Value');
            expect(valueElement).toBeInTheDocument();
        });

        it('should render with custom sx styles', () => {
            const customSx = { backgroundColor: 'red', padding: 2 };
            render(<ProductInfoRow {...defaultProps} sx={customSx} />);

            const listItem = screen.getByRole('listitem');
            expect(listItem).toBeInTheDocument();
        });

        it('should merge custom sx with default styles', () => {
            const customSx = { padding: 3, margin: 1 };
            render(<ProductInfoRow {...defaultProps} sx={customSx} />);

            const listItem = screen.getByRole('listitem');
            expect(listItem).toBeInTheDocument();
        });
    });

    describe('ReactNode Value Handling', () => {
        it('should render with string value', () => {
            render(<ProductInfoRow label="String Label" value="Simple string value" />);

            expect(screen.getByText('String Label')).toBeInTheDocument();
            expect(screen.getByText('Simple string value')).toBeInTheDocument();
        });

        it('should render with number value', () => {
            render(<ProductInfoRow label="Number Label" value={42} />);

            expect(screen.getByText('Number Label')).toBeInTheDocument();
            expect(screen.getByText('42')).toBeInTheDocument();
        });

        it('should render with JSX element as value', () => {
            const jsxValue = <span data-testid="jsx-value">JSX Content</span>;
            render(<ProductInfoRow label="JSX Label" value={jsxValue} />);

            expect(screen.getByText('JSX Label')).toBeInTheDocument();
            expect(screen.getByTestId('jsx-value')).toBeInTheDocument();
            expect(screen.getByText('JSX Content')).toBeInTheDocument();
        });

        it('should render with complex JSX structure as value', () => {
            const complexValue = (
                <div data-testid="complex-value">
                    <span>Part 1</span>
                    <strong>Part 2</strong>
                    <em>Part 3</em>
                </div>
            );
            render(<ProductInfoRow label="Complex Label" value={complexValue} />);

            expect(screen.getByText('Complex Label')).toBeInTheDocument();
            expect(screen.getByTestId('complex-value')).toBeInTheDocument();
            expect(screen.getByText('Part 1')).toBeInTheDocument();
            expect(screen.getByText('Part 2')).toBeInTheDocument();
            expect(screen.getByText('Part 3')).toBeInTheDocument();
        });

        it('should render with boolean value', () => {
            render(<ProductInfoRow label="Boolean Label" value={true} />);

            expect(screen.getByText('Boolean Label')).toBeInTheDocument();
            const listItem = screen.getByRole('listitem');
            expect(listItem).toBeInTheDocument();
        });

        it('should render with null value', () => {
            render(<ProductInfoRow label="Null Label" value={null} />);

            expect(screen.getByText('Null Label')).toBeInTheDocument();
            const listItem = screen.getByRole('listitem');
            expect(listItem).toBeInTheDocument();
        });

        it('should render with undefined value', () => {
            render(<ProductInfoRow label="Undefined Label" value={undefined} />);

            expect(screen.getByText('Undefined Label')).toBeInTheDocument();
            const listItem = screen.getByRole('listitem');
            expect(listItem).toBeInTheDocument();
        });

        it('should render with array as value', () => {
            const arrayValue = ['Item 1', 'Item 2', 'Item 3'];
            render(<ProductInfoRow label="Array Label" value={arrayValue} />);

            expect(screen.getByText('Array Label')).toBeInTheDocument();
            expect(screen.getByText('Item 1Item 2Item 3')).toBeInTheDocument();
        });
    });

    describe('All Prop Combinations', () => {
        it('should render with all possible labelVariant and valueVariant combinations', () => {
            const combinations = [
                { labelVariant: 'body1' as const, valueVariant: 'body2' as const },
                { labelVariant: 'body1' as const, valueVariant: 'h6' as const },
                { labelVariant: 'body2' as const, valueVariant: 'body2' as const },
                { labelVariant: 'body2' as const, valueVariant: 'h6' as const },
            ];

            combinations.forEach(({ labelVariant, valueVariant }, index) => {
                const { unmount } = render(
                    <ProductInfoRow
                        label={`Label ${index}`}
                        value={`Value ${index}`}
                        labelVariant={labelVariant}
                        valueVariant={valueVariant}
                    />
                );

                expect(screen.getByText(`Label ${index}`)).toBeInTheDocument();
                expect(screen.getByText(`Value ${index}`)).toBeInTheDocument();

                unmount();
            });
        });

        it('should work with all props provided', () => {
            const customSx = { backgroundColor: 'blue', margin: 2 };
            const complexValue = <div data-testid="full-test">Full test value</div>;

            render(
                <ProductInfoRow
                    label="Full Test Label"
                    value={complexValue}
                    labelVariant="body2"
                    valueVariant="h6"
                    sx={customSx}
                />
            );

            expect(screen.getByText('Full Test Label')).toBeInTheDocument();
            expect(screen.getByTestId('full-test')).toBeInTheDocument();
            expect(screen.getByText('Full test value')).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle very long label text', () => {
            const longLabel = 'This is a very long label that might wrap to multiple lines and should still be rendered correctly without breaking the component layout or functionality';
            render(<ProductInfoRow label={longLabel} value="Short value" />);

            expect(screen.getByText(longLabel)).toBeInTheDocument();
            expect(screen.getByText('Short value')).toBeInTheDocument();
        });

        it('should handle very long string value', () => {
            const longValue = 'This is a very long value that might wrap to multiple lines and should still be rendered correctly without breaking the component layout or functionality';
            render(<ProductInfoRow label="Short label" value={longValue} />);

            expect(screen.getByText('Short label')).toBeInTheDocument();
            expect(screen.getByText(longValue)).toBeInTheDocument();
        });

        it('should handle special characters in label and value', () => {
            const specialLabel = 'Label with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
            const specialValue = 'Value with special chars: ñáéíóú çü ß § £ ¥ € ¢';

            render(<ProductInfoRow label={specialLabel} value={specialValue} />);

            expect(screen.getByText(specialLabel)).toBeInTheDocument();
            expect(screen.getByText(specialValue)).toBeInTheDocument();
        });

        it('should handle whitespace-only label and value', () => {
            render(<ProductInfoRow label="   " value="   " />);

            const listItem = screen.getByRole('listitem');
            expect(listItem).toBeInTheDocument();
        });

        it('should handle numeric strings', () => {
            render(<ProductInfoRow label="123" value="456.789" />);

            expect(screen.getByText('123')).toBeInTheDocument();
            expect(screen.getByText('456.789')).toBeInTheDocument();
        });
    });

    describe('Complex sx Props', () => {
        it('should handle complex sx object', () => {
            const complexSx = {
                my: 2,
                padding: { xs: 1, sm: 2, md: 3 },
                backgroundColor: 'primary.main',
                '&:hover': {
                    backgroundColor: 'primary.dark',
                },
                fontSize: '1.2rem',
            };

            render(<ProductInfoRow {...defaultProps} sx={complexSx} />);

            const listItem = screen.getByRole('listitem');
            expect(listItem).toBeInTheDocument();
        });

        it('should handle sx with function values', () => {
            const functionalSx = {
                my: 1,
                color: (theme: any) => theme.palette.primary.main,
                padding: 2,
            };

            render(<ProductInfoRow {...defaultProps} sx={functionalSx} />);

            const listItem = screen.getByRole('listitem');
            expect(listItem).toBeInTheDocument();
        });

        it('should override default my: 1 with custom sx', () => {
            const overrideSx = { my: 3, padding: 1 };

            render(<ProductInfoRow {...defaultProps} sx={overrideSx} />);

            const listItem = screen.getByRole('listitem');
            expect(listItem).toBeInTheDocument();
        });
    });

    describe('Component Structure', () => {
        it('should have correct component hierarchy', () => {
            render(<ProductInfoRow {...defaultProps} />);

            const listItem = screen.getByRole('listitem');
            expect(listItem).toBeInTheDocument();

            const typographyElements = screen.getAllByText(/Test/);
            expect(typographyElements).toHaveLength(2);
        });

        it('should maintain accessibility with proper structure', () => {
            render(<ProductInfoRow label="Accessible Label" value="Accessible Value" />);

            const listItem = screen.getByRole('listitem');
            expect(listItem).toBeInTheDocument();

            expect(screen.getByText('Accessible Label')).toBeInTheDocument();
            expect(screen.getByText('Accessible Value')).toBeInTheDocument();
        });
    });
});