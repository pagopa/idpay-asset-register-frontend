import { Chip, ChipProps, MenuItem, Select, TextField } from '@mui/material';
import { TFunction } from 'i18next';
import { filterInputWithSpaceRule } from '../../helpers';

import type { FilterConfig } from '../../model/config/ConfigSchema';

export type FiltersProps = Omit<FilterConfig, 'defaultValue'> & {
  labelKey?: string;
};

export type SelectProps = {
  label: string;
  color?: ChipProps['color'];
};

type Props = {
  item: Omit<FiltersProps, 'type'>;
  t: TFunction<'translation', undefined>;
  filters: Record<string, { value: string; label?: string }>;
  setFilters: (id: string, value: { value: string; label?: string }) => void;
  errors?: Array<string>;
  setErrors: (id: string, isError: boolean) => void;
  template?: Record<string, SelectProps>;
};

export const filtersRender: Record<
  'select' | 'text',
  ({ item, t, filters, setFilters, template }: Props) => JSX.Element
> = {
  select: ({ item, t, filters, setFilters, template }) => {
    const { id, labelKey } = item;
    return (
      <Select
        labelId={`${id}-filter-select-label`}
        id={`${id}-filter-select`}
        label={t(labelKey ?? '')}
        MenuProps={{
          disablePortal: true,
          PaperProps: { style: { maxHeight: 350 } },
        }}
        value={filters?.[id]?.value || ''}
        displayEmpty
        renderValue={() => filters?.[id]?.label || ''}
        sx={{ paddingRight: '38px !important' }}
        onChange={(e) =>
          setFilters(id, {
            value: e.target.value,
            label: t(
              (template as any)?.[e.target.value]?.labelKey ??
                (template as any)?.[e.target.value]?.label ??
                ''
            ),
          })
        }
      >
        <MenuItem value="">
          <em>-</em>
        </MenuItem>
        {Object.entries(template || {}).map(([key, value]) => (
          <MenuItem key={key} value={key}>
            {value?.color ? (
              <Chip
                color={value.color}
                label={t((value as any).labelKey ?? (value as any).label)}
              />
            ) : (
              t((value as any).labelKey ?? (value as any).label ?? '')
            )}
          </MenuItem>
        ))}
      </Select>
    );
  },
  text: ({ item, t, filters, setFilters, errors, setErrors }) => {
    const { id, labelKey, regEx, message, inputProps } = item;
    const isError = !!filters?.[id]?.value && errors?.includes(id);
    return (
      <TextField
        fullWidth
        id={`${id}-text`}
        size="small"
        label={t(labelKey ?? '')}
        variant="outlined"
        value={filters?.[id]?.value}
        onChange={(e) => {
          const isError = !!e.target.value && !RegExp(regEx || '').test(e.target.value);
          const ruledValue = filterInputWithSpaceRule(e.target.value);
          setFilters(id, { value: ruledValue });
          setErrors(id, isError);
        }}
        error={isError}
        helperText={message && isError && t(message ?? '')}
        onPaste={(e) => {
          e.preventDefault();
          const text = e.clipboardData.getData('text').replace(/\s+/g, '');
          const ruledValue = filterInputWithSpaceRule(text);
          const isError = !!text && !RegExp(regEx || '').test(text);
          setFilters(id, { value: ruledValue });
          setErrors(id, isError);
        }}
        slotProps={{ htmlInput: inputProps }}
      />
    );
  },
};
