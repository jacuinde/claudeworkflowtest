// @ts-check

/** @typedef {{ label: string, url: string }} Link */

/**
 * @param {HTMLUListElement} list
 * @param {HTMLElement} emptyMessage
 * @param {Link[]} links
 */
function renderLinks(list, emptyMessage, links) {
  emptyMessage.hidden = links.length > 0;
  list.replaceChildren(
    ...links.map(({ label, url }) => {
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.textContent = label;
      const item = document.createElement('li');
      item.append(anchor);
      return item;
    }),
  );
}

/** @returns {Promise<Link[]>} */
async function loadLinks() {
  const response = await fetch('links.json');
  if (!response.ok) {
    throw new Error(`links.json responded ${response.status}`);
  }
  const text = await response.text();
  return text.trim() === '' ? [] : JSON.parse(text);
}

async function main() {
  const list = /** @type {HTMLUListElement} */ (document.getElementById('links'));
  const emptyMessage = /** @type {HTMLElement} */ (document.getElementById('no-links'));
  const loadError = /** @type {HTMLElement} */ (document.getElementById('load-error'));
  try {
    renderLinks(list, emptyMessage, await loadLinks());
  } catch (error) {
    console.error('Failed to load links:', error);
    loadError.hidden = false;
  }
}

main();
