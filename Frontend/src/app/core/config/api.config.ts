import { environment } from '../../../environments/environment';

const baseUrl = environment.apiBaseUrl.replace(/\/+$/, '');

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}
