// @ts-check
const { test, expect } = require('@playwright/test');
const { serveLinks, visibleLinks } = require('./helpers');

const LINKS = [
  { label: 'GitHub', url: 'https://github.com' },
  { label: 'GitLab', url: 'https://gitlab.com' },
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

test('narrows the list on every keystroke', async ({ page }) => {
  await searchBox(page).pressSequentially('Gi');
  await expect(visibleLinks(page)).toHaveText(['GitHub', 'GitLab']);

  await searchBox(page).pressSequentially('tH');
  await expect(visibleLinks(page)).toHaveText(['GitHub']);
});

test('matches label or URL, ignoring case and surrounding spaces', async ({ page }) => {
  await searchBox(page).fill('MOZILLA');
  await expect(visibleLinks(page)).toHaveText(['MDN Web Docs']);

  await searchBox(page).fill('WEB DOCS');
  await expect(visibleLinks(page)).toHaveText(['MDN Web Docs']);

  await searchBox(page).fill('  github ');
  await expect(visibleLinks(page)).toHaveText(['GitHub']);
});

test('clearing the search restores the full list', async ({ page }) => {
  await searchBox(page).fill('mdn');
  await expect(visibleLinks(page)).toHaveText(['MDN Web Docs']);

  await searchBox(page).clear();
  await expect(visibleLinks(page)).toHaveText(['GitHub', 'GitLab', 'MDN Web Docs']);
});

test('shows "No matches" when nothing matches, and hides it once something does', async ({ page }) => {
  const noMatches = page.getByText('No matches');
  await expect(noMatches).toBeHidden();

  await searchBox(page).fill('zzz');
  await expect(visibleLinks(page)).toHaveCount(0);
  await expect(noMatches).toBeVisible();

  await searchBox(page).fill('git');
  await expect(noMatches).toBeHidden();
  await expect(visibleLinks(page)).toHaveText(['GitHub', 'GitLab']);
});

test('applies a search typed before the links finish loading', async ({ page }) => {
  /** @type {() => void} */
  let releaseLinks = () => {};
  const linksHeld = new Promise((resolve) => (releaseLinks = () => resolve(undefined)));
  await page.route('**/links.json', async (route) => {
    await linksHeld;
    await route.fulfill({ json: LINKS });
  });

  await page.goto('/');
  await searchBox(page).fill('zzz');
  releaseLinks();

  await expect(page.getByText('No matches')).toBeVisible();
  await expect(visibleLinks(page)).toHaveCount(0);
});
