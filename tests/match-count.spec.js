// @ts-check
const { test, expect } = require('@playwright/test');
const { serveLinks, visibleLinks } = require('./helpers');

const LINKS = [
  { label: 'GitHub', url: 'https://github.com' },
  { label: 'GitLab', url: 'https://gitlab.com' },
  { label: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
  { label: 'Stack Overflow', url: 'https://stackoverflow.com' },
];

/** @param {import('@playwright/test').Page} page */
function searchBox(page) {
  return page.getByRole('searchbox', { name: 'Search links' });
}

/** @param {import('@playwright/test').Page} page */
function matchCount(page) {
  return page.getByText(/^Showing \d+ of \d+ links$/);
}

test('reads "Showing N of N links" when the search box is empty', async ({ page }) => {
  await serveLinks(page, LINKS);

  await page.goto('/');

  await expect(visibleLinks(page)).toHaveCount(LINKS.length);
  await expect(matchCount(page)).toHaveText('Showing 4 of 4 links');
  await expect(matchCount(page)).toBeVisible();
});

test('counts only the links still visible as you type', async ({ page }) => {
  await serveLinks(page, LINKS);
  await page.goto('/');
  await expect(matchCount(page)).toHaveText('Showing 4 of 4 links');

  await searchBox(page).pressSequentially('Gi');
  await expect(visibleLinks(page)).toHaveText(['GitHub', 'GitLab']);
  await expect(matchCount(page)).toHaveText('Showing 2 of 4 links');

  await searchBox(page).pressSequentially('tH');
  await expect(visibleLinks(page)).toHaveText(['GitHub']);
  await expect(matchCount(page)).toHaveText('Showing 1 of 4 links');

  await searchBox(page).fill('zzz');
  await expect(visibleLinks(page)).toHaveCount(0);
  await expect(matchCount(page)).toHaveText('Showing 0 of 4 links');

  await searchBox(page).clear();
  await expect(matchCount(page)).toHaveText('Showing 4 of 4 links');
});

test('is hidden when there are no links', async ({ page }) => {
  await serveLinks(page, []);

  await page.goto('/');

  await expect(page.getByText('No links yet')).toBeVisible();
  await expect(page.locator('#match-count')).toBeHidden();

  await searchBox(page).fill('git');
  await expect(page.locator('#match-count')).toBeHidden();
});

test('is hidden when links.json fails to load', async ({ page }) => {
  await page.route('**/links.json', (route) => route.fulfill({ status: 500, body: 'Server error' }));

  await page.goto('/');

  await expect(page.getByRole('alert')).toHaveText("Couldn't load links.");
  await expect(page.locator('#match-count')).toBeHidden();

  await searchBox(page).fill('git');
  await expect(page.locator('#match-count')).toBeHidden();
});
