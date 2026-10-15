// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const { serveLinks, visibleLinks } = require('./helpers');

test('renders every link from the data file, in order, with its label and URL', async ({ page }) => {
  await serveLinks(page, [
    { label: 'Zeta docs', url: 'https://zeta.example/' },
    { label: 'Alpha blog', url: 'https://alpha.example/blog' },
    { label: 'Mid tools', url: 'https://mid.example/tools' },
  ]);

  await page.goto('/');

  const links = visibleLinks(page);
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

test('shows an error message when the data file is malformed', async ({ page }) => {
  await page.route('**/links.json', (route) =>
    route.fulfill({ body: '[{ "label": "Broken", ', contentType: 'application/json' }),
  );

  await page.goto('/');

  await expect(page.getByRole('alert')).toHaveText("Couldn't load links.");
  await expect(page.getByText('No links yet')).toBeHidden();
});

test('shows an error message when the data file is missing', async ({ page }) => {
  await page.route('**/links.json', (route) => route.fulfill({ status: 404, body: 'Not found' }));

  await page.goto('/');

  await expect(page.getByRole('alert')).toHaveText("Couldn't load links.");
  await expect(page.getByText('No links yet')).toBeHidden();
});

test('renders the real links data file', async ({ page }) => {
  /** @type {Link[]} */
  const links = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'links.json'), 'utf8'));

  await page.goto('/');

  await expect(visibleLinks(page)).toHaveText(links.map((link) => link.label));
});

test('ends with the Claude Code docs link', async ({ page }) => {
  await page.goto('/');

  const last = visibleLinks(page).last();
  await expect(last).toHaveText('Claude Code docs');
  await expect(last).toHaveAttribute('href', 'https://code.claude.com/docs');
});
