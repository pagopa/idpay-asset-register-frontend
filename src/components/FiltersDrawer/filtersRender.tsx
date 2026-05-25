import { Chip, ChipProps, MenuItem, Select, TextField } from "@mui/material";
import { TFunction } from "i18next";
import { filterInputWithSpaceRule } from "../../helpers";

export type FiltersProps = {
    id: string;
    type: "select" | "text";
    labelKey: string;
    regEx?: string;
    error?: string;
    inputProps?: Record<string, string>;
};

export type SelectProps = {
    label: string;
    color?: ChipProps["color"];
};

type Props = {
    item: Omit<FiltersProps, 'type'>;
    t: TFunction<"translation", undefined>;
    filters: Record<string, { value: string; label?: string }>;
    setFilters: (value: Record<string, { value: string; label?: string }>) => void;
    errors?: Array<string>;
    setErrors: (errors?: Array<string>) => void;
    template?: Record<string, SelectProps>;
};

export const filtersRender: Record<'select' | 'text', ({ item, t, filters, setFilters, template }: Props) => JSX.Element> = {
    select: ({ item, t, filters, setFilters, template }) => {
        const { id, labelKey } = item;
        return <Select
            labelId={`${id}-filter-select-label`}
            id={`${id}-filter-select`}
            label={t(labelKey)}
            MenuProps={{ PaperProps: { style: { maxHeight: 350 } } }}
            value={filters?.[id]?.value || ''}
            sx={{ paddingRight: '38px !important' }}
        >
            {template ? Object.entries(template).map(([key, value]) => (
                <MenuItem key={key} value={key} onClick={() => setFilters({ [id]: { value: key, label: t(value.label) } })}>
                    {value?.color ? <Chip
                        color={value.color}
                        label={t(value.label)}
                    /> : t(value.label)}
                </MenuItem>
            )) : []}
        </Select>;
    },
    text: ({ item, t, filters, setFilters, errors, setErrors }) => {
        const { id, labelKey, regEx, error, inputProps } = item;
        return <TextField
            fullWidth
            id={`${id}-text`}
            size="small"
            label={t(labelKey)}
            variant="outlined"
            value={filters?.[id]?.value}
            onChange={(e) => {
                const isError = e.target.value && !(RegExp(regEx || '').test(e.target.value));
                const ruledValue = filterInputWithSpaceRule(e.target.value);
                setFilters({ [id]: { value: ruledValue } });
                setErrors(isError ? [...(errors || []), id] : errors?.filter(error => error !== id));
            }}
            error={errors?.includes(id)}
            helperText={error && t(error)}
            onPaste={(e) => {
                e.preventDefault();
                const text = e.clipboardData.getData('text').replace(/\s+/g, '');
                const ruledValue = filterInputWithSpaceRule(text);
                const isError = text && !(RegExp(regEx || '').test(text));
                setFilters({ [id]: { value: ruledValue } });
                setErrors(isError ? [...(errors || []), id] : errors?.filter(error => error !== id));
            }}
            slotProps={{ htmlInput: inputProps }}
        />;
    }
};