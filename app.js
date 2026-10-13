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

async function main() {
  const list = /** @type {HTMLUListElement} */ (document.getElementById('links'));
  const emptyMessage = /** @type {HTMLElement} */ (document.getElementById('no-links'));
  const response = await fetch('links.json');
  const text = await response.text();
  /** @type {Link[]} */
  const links = text.trim() === '' ? [] : JSON.parse(text);
  renderLinks(list, emptyMessage, links);
}

main();
