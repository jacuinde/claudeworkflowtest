// @ts-check
const { test, expect } = require('@playwright/test');
const { serveLinks, visibleLinks } = require('./helpers');

const LINKS = [
  { label: 'GitHub', url: 'https://github.com' },
  { label: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
];

/** @param {import('@playwright/test').Page} page */
function searchBox(page) {
  return page.getByRole('searchbox', { name: 'Search links' });
}

test.beforeEach(async ({ page }) => {
  await serveLinks(page, LINKS);
  await page.goto('/');
  await expect(visibleLinks(page)).toHaveCount(LINKS.length);
});

test('pressing / outside a text field focuses the search box without typing "/"', async ({ page }) => {
  await expect(searchBox(page)).not.toBeFocused();

  await page.keyboard.press('/');

  await expect(searchBox(page)).toBeFocused();
  await expect(searchBox(page)).toHaveValue('');
});

test('pressing / while a button has focus focuses the search box', async ({ page }) => {
  await page.getByRole('button', { name: 'Dark theme' }).focus();

  await page.keyboard.press('/');

  await expect(searchBox(page)).toBeFocused();
  await expect(searchBox(page)).toHaveValue('');
});

test('typing / inside the search box types a "/" as normal', async ({ page }) => {
  await searchBox(page).click();

  await page.keyboard.type('mozilla.org/');

  await expect(searchBox(page)).toHaveValue('mozilla.org/');
  await expect(searchBox(page)).toBeFocused();
});
