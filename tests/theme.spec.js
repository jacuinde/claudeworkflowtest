// @ts-check
const { test, expect } = require('@playwright/test');
const { serveLinks } = require('./helpers');

/**
 * WCAG relative luminance of a computed `rgb(...)` / `rgba(...)` colour, 0 (black) to 1 (white).
 * @param {string} cssColor
 */
function luminance(cssColor) {
  const [r, g, b] = (cssColor.match(/[\d.]+/g) ?? []).slice(0, 3).map((part) => {
    const channel = Number(part) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Whether the page currently shows a dark background.
 * @param {import('@playwright/test').Page} page
 */
async function looksDark(page) {
  const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  return luminance(background) < 0.2;
}

test('with no saved choice, follows the OS colour scheme', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect.poll(() => looksDark(page)).toBe(true);

  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await expect.poll(() => looksDark(page)).toBe(false);
});

/** @param {import('@playwright/test').Page} page */
function themeToggle(page) {
  return page.getByRole('button', { name: 'Dark theme' });
}

test('clicking the toggle switches the theme and shows which one is active', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await expect(themeToggle(page)).toHaveAttribute('aria-pressed', 'false');

  await themeToggle(page).click();
  await expect(themeToggle(page)).toHaveAttribute('aria-pressed', 'true');
  expect(await looksDark(page)).toBe(true);

  await themeToggle(page).click();
  await expect(themeToggle(page)).toHaveAttribute('aria-pressed', 'false');
  expect(await looksDark(page)).toBe(false);
});

test('the chosen theme persists across reloads and wins over the OS setting', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await themeToggle(page).click();
  await expect(themeToggle(page)).toHaveAttribute('aria-pressed', 'false');

  await page.reload();

  await expect(themeToggle(page)).toHaveAttribute('aria-pressed', 'false');
  expect(await looksDark(page)).toBe(false);

  await page.emulateMedia({ colorScheme: 'light' });
  await themeToggle(page).click();
  await page.reload();

  await expect(themeToggle(page)).toHaveAttribute('aria-pressed', 'true');
  expect(await looksDark(page)).toBe(true);
});

test('with no saved choice, the toggle tracks an OS theme change while the page is open', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await expect(themeToggle(page)).toHaveAttribute('aria-pressed', 'false');

  await page.emulateMedia({ colorScheme: 'dark' });

  await expect(themeToggle(page)).toHaveAttribute('aria-pressed', 'true');
  expect(await looksDark(page)).toBe(true);
});

/**
 * WCAG contrast ratio between two computed colours, from 1 (none) to 21 (black on white).
 * @param {string} a
 * @param {string} b
 */
function contrastRatio(a, b) {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

// Each text element and the element whose background it sits on.
const TEXT_ON_BACKGROUND = [
  ['body', 'body'],
  ['#links a', '#links a'],
  ['#no-links', 'body'],
  ['#no-matches', 'body'],
  ['#load-error', 'body'],
  ['#search', '#search'],
  ['#theme-toggle', '#theme-toggle'],
];

for (const colorScheme of /** @type {const} */ (['light', 'dark'])) {
  test(`text and links meet WCAG AA contrast (4.5:1) in the ${colorScheme} theme`, async ({ page }) => {
    await serveLinks(page, [{ label: 'Example', url: 'https://example.com' }]);
    await page.emulateMedia({ colorScheme });
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Example' })).toBeVisible();

    for (const [textSelector, backgroundSelector] of TEXT_ON_BACKGROUND) {
      const text = await page.locator(textSelector).evaluate((el) => getComputedStyle(el).color);
      const background = await page
        .locator(backgroundSelector)
        .evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(contrastRatio(text, background), `${textSelector} on ${backgroundSelector}`).toBeGreaterThanOrEqual(4.5);
    }
  });
}
