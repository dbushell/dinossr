const islands = new WeakSet();
const islandCount = new Map();
const contextData = JSON.parse(
  document.querySelector('[data-context="%DEPLOY_HASH%"]')?.textContent ?? '{}'
);
class Island extends HTMLElement {
  constructor() {
    super();
  }
  async connectedCallback() {
    if (islands.has(this)) {
      return;
    }
    islands.add(this);
    const {island} = this.dataset;
    const count = islandCount.get(island) ?? 0;
    islandCount.set(island, count + 1);
    if (this.parentNode.closest('dinossr-island')) {
      return;
    }
    const context = new Map(Object.entries(structuredClone(contextData)));
    context.set('url', new URL(contextData.url, window.location.href));
    const selector = `[data-island="${island}"][type*="/json"]`;
    const json = document.querySelectorAll(selector).item(count);
    const props = json ? JSON.parse(json.textContent) : {};
    const mod = await import(`/_/immutable/${island}.js`);
    const target = document.createDocumentFragment();
    const div = document.createElement('div');
    this.replaceWith(div);
    target.appendChild(this);
    new mod.default({context, props, target, hydrate: true});
    div.replaceWith(target);
  }
}
customElements.define('dinossr-island', Island);
