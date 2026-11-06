export function isNonEmpty(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export function isValidZipCode(value: string): boolean {
  return /^\d{5}$/.test(value.trim());
}

export function isValidUsPhone(value: string): boolean {
  return value.replace(/\D/g, '').length === 10;
}

export function isWholeNumber(value: unknown): boolean {
  if (typeof value === 'number') {
    return Number.isInteger(value) && value >= 0;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    return /^\d+$/.test(value.trim());
  }

  return false;
}
