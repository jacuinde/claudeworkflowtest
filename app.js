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

/**
 * Hide every list item whose link label and URL don't contain `query`.
 * @param {HTMLUListElement} list
 * @param {string} query
 * @returns {number} how many items still match
 */
function filterLinks(list, query) {
  const needle = query.trim().toLowerCase();
  let matches = 0;
  for (const item of list.children) {
    const anchor = /** @type {HTMLAnchorElement} */ (item.querySelector('a'));
    const fields = [anchor.textContent ?? '', anchor.getAttribute('href') ?? ''];
    const isMatch = fields.some((field) => field.toLowerCase().includes(needle));
    /** @type {HTMLElement} */ (item).hidden = !isMatch;
    if (isMatch) matches++;
  }
  return matches;
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

/**
 * @param {EventTarget | null} target
 * @returns {boolean} whether keys pressed at `target` type text
 */
function isTextField(target) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable || target instanceof HTMLTextAreaElement) return true;
  if (!(target instanceof HTMLInputElement)) return false;
  const nonTextTypes = ['button', 'checkbox', 'color', 'file', 'hidden', 'image', 'radio', 'range', 'reset', 'submit'];
  return !nonTextTypes.includes(target.type);
}

async function main() {
  const list = /** @type {HTMLUListElement} */ (document.getElementById('links'));
  const emptyMessage = /** @type {HTMLElement} */ (document.getElementById('no-links'));
  const loadError = /** @type {HTMLElement} */ (document.getElementById('load-error'));
  const search = /** @type {HTMLInputElement} */ (document.getElementById('search'));
  const noMatches = /** @type {HTMLElement} */ (document.getElementById('no-matches'));
  const matchCount = /** @type {HTMLElement} */ (document.getElementById('match-count'));
  const applySearch = () => {
    const total = list.children.length;
    const matches = filterLinks(list, search.value);
    noMatches.hidden = matches > 0 || total === 0;
    matchCount.hidden = total === 0;
    matchCount.textContent = `Showing ${matches} of ${total} ${total === 1 ? 'link' : 'links'}`;
  };
  search.addEventListener('input', applySearch);
  document.addEventListener('keydown', (event) => {
    if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return;
    if (isTextField(event.target)) return;
    event.preventDefault();
    search.focus();
  });
  try {
    renderLinks(list, emptyMessage, await loadLinks());
    applySearch();
  } catch (error) {
    console.error('Failed to load links:', error);
    loadError.hidden = false;
  }
}

main();
