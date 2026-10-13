// @ts-check
// Loaded as a blocking script in <head> so a saved theme applies before first paint.
// Wrapped in an IIFE to keep its names out of the global scope shared with app.js.
(() => {
  /** @typedef {'light' | 'dark'} Theme */

  const THEME_KEY = 'theme';
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  /**
   * @param {unknown} value
   * @returns {Theme | null}
   */
  function asTheme(value) {
    return value === 'light' || value === 'dark' ? value : null;
  }

  /** @returns {Theme | null} */
  function savedTheme() {
    try {
      return asTheme(localStorage.getItem(THEME_KEY));
    } catch {
      return null;
    }
  }

  /** @param {Theme} theme */
  function saveTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Storage unavailable (private mode, blocked): the choice lasts for this page only.
    }
  }

  /** @param {Theme} theme */
  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
  }

  /** @returns {Theme} */
  function activeTheme() {
    return asTheme(document.documentElement.dataset.theme) ?? (prefersDark.matches ? 'dark' : 'light');
  }

  /** @param {HTMLButtonElement} toggle */
  function syncTogglePressed(toggle) {
    toggle.setAttribute('aria-pressed', String(activeTheme() === 'dark'));
  }

  const initialTheme = savedTheme();
  if (initialTheme) applyTheme(initialTheme);

  document.addEventListener('DOMContentLoaded', () => {
    const toggle = /** @type {HTMLButtonElement} */ (document.getElementById('theme-toggle'));
    syncTogglePressed(toggle);
    prefersDark.addEventListener('change', () => syncTogglePressed(toggle));
    toggle.addEventListener('click', () => {
      const next = activeTheme() === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      saveTheme(next);
      syncTogglePressed(toggle);
    });
  });
})();
