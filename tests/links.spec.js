// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

/**
 * Serve `links` in place of the real data file for this page.
 * @param {import('@playwright/test').Page} page
 * @param {unknown} links
 */
async function serveLinks(page, links) {
  await page.route('**/links.json', (route) => route.fulfill({ json: links }));
}

test('renders every link from the data file, in order, with its label and URL', async ({ page }) => {
  await serveLinks(page, [
    { label: 'Zeta docs', url: 'https://zeta.example/' },
    { label: 'Alpha blog', url: 'https://alpha.example/blog' },
    { label: 'Mid tools', url: 'https://mid.example/tools' },
  ]);

  await page.goto('/');

  const links = page.getByRole('list', { name: 'Links' }).getByRole('link');
  await expect(links).toHaveText(['Zeta docs', 'Alpha blog', 'Mid tools']);
  await expect(links.nth(0)).toHaveAttribute('href', 'https://zeta.example/');
  await expect(links.nth(1)).toHaveAttribute('href', 'https://alpha.example/blog');
  await expect(links.nth(2)).toHaveAttribute('href', 'https://mid.example/tools');
  await expect(page.getByText('No links yet')).toBeHidden();
});

test('shows a "no links yet" message when the data file is empty', async ({ page }) => {
  await serveLinks(page, []);

  await page.goto('/');

  await expect(page.getByText('No links yet')).toBeVisible();
  await expect(page.getByRole('link')).toHaveCount(0);
});

test('shows a "no links yet" message when the data file is blank', async ({ page }) => {
  await page.route('**/links.json', (route) =>
    route.fulfill({ body: '', contentType: 'application/json' }),
  );

  await page.goto('/');

  await expect(page.getByText('No links yet')).toBeVisible();
});

test('renders the real links data file', async ({ page }) => {
  /** @type {Link[]} */
  const links = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'links.json'), 'utf8'));

  await page.goto('/');

  await expect(page.getByRole('list', { name: 'Links' }).getByRole('link')).toHaveText(
    links.map((link) => link.label),
  );
});
