import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { filtersRender } from '../filtersRender';

describe("Render component", () => {
    const defaultProps = {
        filters: {},
        t: (value) => value,
        setFilters: jest.fn(),
        errors: [],
        setErrors: jest.fn()
    }
    it("should render select component", async () => {
        const props = {
            ...defaultProps,
            item: {
                id: "status",
                labelKey: "tables.products.filters.status"
            },
            template: {
                UPLOADED: {
                    label: "UPLOADED"
                }
            }
        }
        render(filtersRender.select(props))

        const select = screen.getByRole("combobox")

        expect(select).toBeInTheDocument();
        await userEvent.click(select)

        const option = screen.getByText("UPLOADED")
        await userEvent.click(option)

        expect(props.setFilters).toHaveBeenCalled()
    })
    it("should render text component", async () => {
        const props = {
            ...defaultProps,
            item: {
                id: "gtinCode",
                labelKey: "tables.products.filters.gtinCode"
            },
        }
        render(filtersRender.text(props))

        const textInput = screen.getByRole("textbox")

        expect(textInput).toBeInTheDocument();
        await userEvent.type(textInput, "GTINCODETEST01")

        expect(props.setFilters).toHaveBeenCalledTimes(14)
    })
    it("should paste text", async () => {
        
        const props = {
            ...defaultProps,
            item: {
                id: "gtinCode",
                labelKey: "tables.products.filters.gtinCode"
            },
        }
        render(filtersRender.text(props))

        const textInput = screen.getByRole("textbox")

        await userEvent.click(textInput)
        await userEvent.paste("GTINCODETEST01")
        
        expect(props.setFilters).toHaveBeenCalledWith("gtinCode", {value: "GTINCODETEST01"})
    })
    it("should show error", async () => {
        
        const props = {
            ...defaultProps,
            item: {
                id: "gtinCode",
                labelKey: "tables.products.filters.gtinCode",
            },
        }
        render(filtersRender.text(props))

        const textInput = screen.getByRole("textbox")

        await userEvent.click(textInput)
        await userEvent.paste("+++")
        expect(props.setFilters).toHaveBeenCalledWith("gtinCode", {value: "+++"})
        expect(props.setErrors).toHaveBeenCalled()
    })
})