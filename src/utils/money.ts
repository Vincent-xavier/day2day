const MAX_AMOUNT_MINOR = 10_000_000 * 100; // $10,000,000 sanity ceiling

export type MoneyParseResult = { ok: true; minor: number } | { ok: false; error: string };

/**
 * Parses a raw text input (e.g. "1,234.5") into an integer amount in minor
 * units (cents). Unlike `Math.round(Number(input) * 100)`, this rejects
 * inputs with more than 2 decimal places instead of silently rounding them,
 * so money never changes value without the user seeing why.
 */
export function parseMoneyMinor(rawInput: string): MoneyParseResult {
  const trimmed = rawInput.replace(/[$,\s]/g, '');
  if (!trimmed) return { ok: false, error: 'Enter an amount.' };
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    return { ok: false, error: 'Use up to 2 decimal places, e.g. 12.50.' };
  }
  const [wholePart, fractionPart = ''] = trimmed.split('.');
  const minor = Number(wholePart) * 100 + Number(fractionPart.padEnd(2, '0'));
  if (!Number.isFinite(minor) || minor <= 0) return { ok: false, error: 'Enter an amount greater than zero.' };
  if (minor > MAX_AMOUNT_MINOR) return { ok: false, error: 'That amount looks too large. Double-check it.' };
  return { ok: true, minor };
}

/** Formats minor units as a locale-aware currency string with thousands separators. */
export function formatMoney(minor: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(minor / 100);
}
