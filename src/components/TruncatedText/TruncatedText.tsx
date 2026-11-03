import { ReactNode, forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Tooltip, Typography } from '@mui/material';
import type { TooltipProps, TypographyProps } from '@mui/material';

type TruncatedTextProps = Omit<TypographyProps, 'title' | 'children'> & {
  /** Content to display on a single line. */
  children: ReactNode;
  /** Optional explicit tooltip content (defaults to `children`). */
  tooltipTitle?: ReactNode;
  tooltipPlacement?: TooltipProps['placement'];
};

/**
 * Renders text on a single line truncating it with an ellipsis when it does not
 * fit the available space. A tooltip with the full content is shown only when
 * the text is actually truncated (overflowing).
 */
const TruncatedText = forwardRef<HTMLElement, TruncatedTextProps>(function TruncatedText(
  { children, tooltipTitle, tooltipPlacement = 'top', sx, ...typographyProps },
  _ref
) {
  const textRef = useRef<HTMLElement | null>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const checkOverflow = () => {
    const el = textRef.current;
    if (el) {
      setIsOverflowing(el.scrollWidth > el.clientWidth);
    }
  };

  useLayoutEffect(() => {
    checkOverflow();
  });

  useEffect(() => {
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, []);

  return (
    <Tooltip
      title={isOverflowing ? tooltipTitle ?? children : ''}
      placement={tooltipPlacement}
      arrow
      slotProps={{ tooltip: { sx: { textAlign: 'center', wordBreak: 'break-word' } } }}
    >
      <Typography
        ref={textRef}
        noWrap
        sx={{
          display: 'block',
          maxWidth: '100%',
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          ...sx,
        }}
        {...typographyProps}
      >
        {children}
      </Typography>
    </Tooltip>
  );
});

export default TruncatedText;

