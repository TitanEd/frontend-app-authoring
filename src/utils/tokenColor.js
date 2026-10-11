/**
 * Design token colors for places that cannot use CSS variables directly
 * (ApexCharts options, SVG attributes): reads the computed value of a
 * --pgn-* token from the brand theme loaded through PARAGON_THEME_URLS.
 */
export const tokenColor = (name, fallback = '') => {
  try {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
  } catch (e) {
    return fallback;
  }
};

// Chart series colors, in order, taken from the design tokens.
const PALETTE_TOKENS = [
  ['--pgn-color-primary-base', '#0A3055'],
  ['--pgn-color-success-base', '#178253'],
  ['--pgn-color-warning-base', '#F0CC00'],
  ['--pgn-color-info-base', '#006DAA'],
  ['--pgn-color-danger-base', '#C32D3A'],
  ['--pgn-color-secondary-base', '#707070'],
  ['--pgn-color-primary-700', '#082A4B'],
  ['--pgn-color-brand-base', '#9D0054'],
];

export const tokenPalette = (count) => Array.from(
  { length: Math.max(count, 1) },
  (_, i) => tokenColor(...PALETTE_TOKENS[i % PALETTE_TOKENS.length]),
);

export default tokenColor;
