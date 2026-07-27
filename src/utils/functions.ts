export type AddressParts = {
  address?: string | null;
  zipCode?: string | null;
  city?: string | null;
  county?: string | null;
};

export const buildAddress = (data?: AddressParts | null): string => {
  if (!data) {
    return '';
  }

  const { address, zipCode, city, county } = data;

  if (!address && !zipCode && !city && !county) {
    return '';
  }

  const parts = [
    address ?? '',
    zipCode ? `, ${zipCode}` : '',
    city ? ` ${city}` : '',
    county ? ` (${county})` : '',
  ];

  return parts.join('').trim();
};

