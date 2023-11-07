<script>
  import {getContext} from 'svelte';

  /** @type {string} */
  export let heading;

  /** @type {URL} */
  const url = getContext('url');

  /** @type {Array<{href: string; text: string; active?: boolean}>} */
  const items = [
    {href: '/', text: 'Home'},
    {href: '/docs/', text: 'Documentation'},
    {href: 'https://github.com/dbushell/dinossr/', text: 'GitHub'}
  ];

  items.forEach((item) => {
    if (!url) return;
    if (url.pathname === item.href) {
      item.active = true;
      return;
    }
    // Ignore homepage matching everything
    if (item.href === '/' || url.pathname === '/') {
      return;
    }
    // Match sub-pages
    if (url.pathname.startsWith(item.href)) {
      item.active = true;
      return;
    }
  });
</script>

<nav class="navbar navbar-expand-lg bg-body-tertiary">
  <div class="container">
    <div class="d-flex align-items-center">
      <img src="/logo.png" alt="" width="32" height="32" class="me-2" />
      <a class="navbar-brand" href="/">{heading}</a>
    </div>
    <ul class="nav">
      {#each items as item}
        <li class="nav-item">
          <a
            class="nav-link"
            class:text-body-emphasis={item.active}
            aria-current={item.active ? 'page' : undefined}
            href={item.href}
          >
            <span>{item.text}</span>
          </a>
        </li>
      {/each}
    </ul>
  </div>
</nav>
