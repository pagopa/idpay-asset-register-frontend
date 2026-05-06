import { BASE_ROUTE } from '../routes';

const stripBaseRoute = (pathname: string, baseRoute: string) =>
  baseRoute !== '/' && pathname.startsWith(baseRoute) ? pathname.slice(baseRoute.length) : pathname;

const hasEmptyInnerSegments = (pathname: string) => {
  const segments = pathname.split('/');
  return segments.length > 2 && segments.slice(1, -1).some((s) => s === '');
};

const hasDotSegments = (pathname: string) => /\/\.(\/|$)|\/\.\.(\/|$)/.test(pathname);

export const isMalformedPathname = (pathname: string, baseRoute: string = BASE_ROUTE): boolean => {
  const effectivePathname = stripBaseRoute(pathname, baseRoute);
  return hasEmptyInnerSegments(effectivePathname) || hasDotSegments(effectivePathname);
};
