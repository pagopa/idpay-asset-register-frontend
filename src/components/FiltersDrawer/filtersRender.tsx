import { Box, Chip, ChipProps, IconButton, InputAdornment, MenuItem, Select, TextField } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { MIChip } from '@pagopa/mui-italia/components/MIChip';
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

const renderSelectOption = (id: string, value: SelectProps, t: Props['t']) => {
  const label = t((value as any)?.labelKey ?? value?.label ?? '');
  if (!value?.color) {
    return label;
  }
  if (id === 'status' && ['default', 'success', 'info', 'warning', 'error'].includes(value.color)) {
    return <MIChip color={value.color as 'default' | 'success' | 'info' | 'warning' | 'error'} label={label} />;
  }
  return <Chip color={value.color} label={label} />;
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
        value={filters?.[id]?.value ?? ''}
        endAdornment={filters?.[id]?.value ? (
          <InputAdornment position="end" sx={{ mr: 3 }}>
            <IconButton
              size="small"
              aria-label={`${t('common.clearSingleFilter')} ${t(labelKey ?? id)}`}
              onMouseDown={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                document.getElementById(`${id}-filter-select`)?.focus();
                setFilters(id, { value: '', label: '' });
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ) : undefined}
        renderValue={() => (
          <Box
            sx={{
              maxWidth: '95%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {filters?.[id]?.label ?? ''}
          </Box>
        )}
        onChange={(e) =>
          setFilters(id, {
            value: e.target.value,
            label: e.target.value ? t(
              (template as any)?.[e.target.value]?.labelKey ??
                (template as any)?.[e.target.value]?.label ??
                ''
            ) : '',
          })
        }
      >
        {Object.entries(template || {}).map(([key, value]) => (
          <MenuItem key={key} value={key}>
            {renderSelectOption(id, value, t)}
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
        value={filters?.[id]?.value ?? ''}
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
        inputProps={inputProps}
      />
    );
  },
};
