import { useTheme, useMediaQuery } from '@mui/material';
import {EMPTY_DATA, MAX_LENGTH_TABLE_PR, MAX_LENGTH_EMAIL, MIN_LENGTH_TABLE_PR} from "./utils/constants";

export const formattedCurrency = (
  number: number | undefined,
  symbol: string = EMPTY_DATA,
  cents: boolean = false
) => {
  if (number && cents === false) {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(number);
  } else if (number && cents === true) {
    const roundedNumberStr = number.toFixed(2);
    const roundedNumber = parseFloat(roundedNumberStr) / 100;
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(
      roundedNumber
    );
  }
  return symbol;
};

export const formatIban = (iban: string | undefined) => {
  if (iban) {
    return `${iban.slice(0, 2)} ${iban.slice(2, 4)} ${iban.slice(4, 5)} ${iban.slice(
      5,
      10
    )} ${iban.slice(10, 15)} ${iban.slice(15, 32)}`;
  }
  return '';
};

export const formatDate = (date: Date | undefined) => {
  if (date) {
    return date.toLocaleString('fr-BE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Europe/Rome',
      hour: 'numeric',
      minute: 'numeric',
    });
  }
  return '';
};

export const formatDateWithHours = (isoDate: Date | null | undefined): string => {
    if (!isoDate) {
        return EMPTY_DATA;
    }
    const day = String(isoDate.getDate()).padStart(2, '0');
    const month = String(isoDate.getMonth() + 1).padStart(2, '0');
    const year = isoDate.getFullYear();
    const hours = String(isoDate.getHours()).padStart(2, '0');
    const minutes = String(isoDate.getMinutes()).padStart(2, '0');
    const seconds = String(isoDate.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
};

export const formatDateWithoutHours = (isoDate: string): string => {
    if (!isoDate) {
        return EMPTY_DATA;
    }
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

export const formatFileName = (name: string | undefined): string => {
    if (typeof name === 'string' && name.length > 15) {
        const nameArr = name.split('.');
        const fileExtension = nameArr[nameArr.length - 1];
        const truncatedName = name.substring(0, 10);
        return `${truncatedName}... .${fileExtension}`;
    } else if (typeof name === 'string' && name.length <= 15) {
        return name;
    }
    return '';
};

export const initUploadBoxStyle = {
    gridColumn: 'span 12',
    alignItems: 'center',
    justifyItems: 'center',
    width: '100%',
    border: '1px dashed #0073E6',
    borderRadius: '10px',
    backgroundColor: 'rgba(0, 115, 230, 0.08)',
    p: 3,
};

export const initUploadHelperBoxStyle = {
    gridColumn: 'span 12',
    alignItems: 'center',
    justifyItems: 'start',
    width: '100%',
    py: 1,
    px: 3,
};

export const fetchUserFromLocalStorage = (): { [key: string]: string } | null => {
    try {
        const userString = localStorage.getItem('user');
        return userString ? JSON.parse(userString) : null;
    } catch (error) {
        return null;
    }
};

export const truncateString = (str?: string, maxLength: number = MAX_LENGTH_EMAIL): string => {
    if (!str) {
        return EMPTY_DATA;
    } else {
        return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
    }
};

export const truncateStringResponsive = (str?: string, maxLength?: number): string => {
  if (!str) {return EMPTY_DATA;}
  if (!maxLength) {return str;}
  return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
};

export const getTablePrLength = () =>
  typeof window !== 'undefined'
    ? window.innerWidth > 1440
      ? MAX_LENGTH_TABLE_PR
      : MIN_LENGTH_TABLE_PR
    : MAX_LENGTH_TABLE_PR;
    
export const useResponsiveMaxLength = (): number => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const isMd = useMediaQuery(theme.breakpoints.only('md'));
  const isLg = useMediaQuery(theme.breakpoints.only('lg'));
  const isXl = useMediaQuery(theme.breakpoints.only('xl'));

  if (isXs) {return 15;}
  if (isSm) {return 25;}
  if (isMd) {return 35;}
  if (isLg) {return 50;}
  if (isXl) {return 70;}
  return 70; 
};
