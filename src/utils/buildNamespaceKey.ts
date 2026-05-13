export function buildNamespaceKey(name: string, startDate: string): string {
  if (!name || !startDate) {
    return '';
  }

  const year = new Date(startDate).getFullYear();

  const normalized = name
    .replace(/\s+/g, '')
    .replace(/[^\w]/g, '')
    .replace(/^\w/, (c) => c.toLowerCase());

  return `${normalized}${year}`;
}
