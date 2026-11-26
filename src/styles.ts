export const genericContainerStyle = {
  display: 'grid',
  width: '100%',
  gridTemplateColumns: 'repeat(12, 1fr)',
};

export const pagesTableContainerStyle = {
  display: 'grid',
  width: '100%',
  gridTemplateColumns: 'repeat(12, 1fr)',
  alignItems: 'center',
};

export const pagesFiltersFormContainerStyle = {
  display: 'grid',
  width: '100%',
  gridTemplateColumns: 'repeat(12, 1fr)',
  alignItems: 'baseline',
  gap: 2,
  mb: 4,
};

export const visuallyHiddenSx = {
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: 1,
  margin: -1,
  overflow: 'hidden',
  padding: 0,
  position: 'absolute' as const,
  top: 20,
  width: 1,
};

