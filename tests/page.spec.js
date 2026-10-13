// @ts-check
const { test, expect } = require('@playwright/test');

test('page shows the site title in the tab and a visible heading', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('Links');
  await expect(page.getByRole('heading', { level: 1, name: 'Links' })).toBeVisible();
});

test('page is styled by its stylesheet, not browser defaults', async ({ page }) => {
  await page.setContent('<body><h1>Unstyled</h1></body>');
  const defaultFont = await page.evaluate(() => getComputedStyle(document.body).fontFamily);

  await page.goto('/');
  const pageFont = await page.evaluate(() => getComputedStyle(document.body).fontFamily);

  expect(pageFont).not.toBe(defaultFont);
});
