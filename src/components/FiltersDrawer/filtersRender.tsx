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
    filters: Record<string, { value: string; label: string }>;
    setFilters: (value: Record<string, { value: string; label: string }>) => void;
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
            value={filters?.[id]?.value}
            sx={{ paddingRight: '38px !important' }}
        >
            {template && Object.entries(template).map(([key, value]) => (
                <MenuItem key={key} value={key} onClick={() => setFilters({ [id]: { value: key, label: t(value.label) } })}>
                    {value?.color ? <Chip
                        color={value.color}
                        label={t(value.label)}
                    /> : t(value.label)}
                </MenuItem>
            ))}
        </Select>;
    },
    text: ({ item, t, filters, setFilters }) => {
        const { id, labelKey, regEx, error, inputProps } = item;
        return <TextField
            fullWidth
            id={`${id}-text`}
            size="small"
            label={t(labelKey)}
            variant="outlined"
            value={filters?.[id]?.value}
            onChange={(e) => {
                const ruledValue = filterInputWithSpaceRule(e.target.value);
                setFilters({ [id]: { value: ruledValue, label: ruledValue } });
            }}
            error={!!filters?.[id]?.value && !(RegExp(regEx || '').test(filters?.[id]?.value))}
            helperText={error && t(error)}
            onPaste={(e) => {
                e.preventDefault();
                const text = e.clipboardData.getData('text').replace(/\s+/g, '');
                const ruledValue = filterInputWithSpaceRule(text);
                setFilters({ [id]: { value: ruledValue, label: ruledValue } });
            }}
            slotProps={{ htmlInput: inputProps }}
        />;
    }
};