const RESET_LINK_HOSTS = /(^|\.)sunhub\.com$/i;

export interface ResetLinkParts {
  email: string;
  token: string;
}

/** Formats digits as the web app does while typing: (555) 123-4567. */
export function formatUsPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits.length ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/**
 * Only same-app paths are accepted as a post-login destination, so a crafted link
 * cannot send a user to another host or to an unexpected scheme after signing in.
 */
export function safeRedirect(value: string | string[] | undefined): string | null {
  const path = Array.isArray(value) ? value[0] : value;
  if (!path || !/^\/[A-Za-z0-9/_\-.%?=&]*$/.test(path) || path.startsWith('//')) return null;
  if (/^\/(login|register|forgot-password|reset-password)(\/|\?|$)/.test(path)) return null;
  return path;
}

/** Reads the email and token out of a reset link pasted from the password-reset email. */
export function parseResetLink(link: string): ResetLinkParts | null {
  const text = link.trim();
  const query = text.includes('?') ? text.slice(text.indexOf('?') + 1) : '';
  const hostMatch = /^https?:\/\/([^/?#]+)/i.exec(text);
  const isAppLink = /^sunhub:\/\//i.test(text);

  if (!query || (!isAppLink && !(hostMatch && RESET_LINK_HOSTS.test(hostMatch[1])))) return null;

  const params = new Map<string, string>();
  for (const pair of query.split('#')[0].split('&')) {
    const [rawKey, ...rest] = pair.split('=');
    try {
      params.set(
        decodeURIComponent(rawKey),
        decodeURIComponent(rest.join('=').replace(/\+/g, ' ')),
      );
    } catch {
      return null;
    }
  }

  const email = params.get('email')?.trim().replace(/\s/g, '+') ?? '';
  const token = params.get('token')?.trim() ?? '';
  return email && token ? { email, token } : null;
}
