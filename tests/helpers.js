// @ts-check

/**
 * Serve `links` in place of the real data file for this page.
 * @param {import('@playwright/test').Page} page
 * @param {unknown} links
 */
async function serveLinks(page, links) {
  await page.route('**/links.json', (route) => route.fulfill({ json: links }));
}

/**
 * The links currently shown in the page's links list.
 * @param {import('@playwright/test').Page} page
 */
function visibleLinks(page) {
  return page.getByRole('list', { name: 'Links' }).getByRole('link');
}

module.exports = { serveLinks, visibleLinks };
