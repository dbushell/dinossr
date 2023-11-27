<script>
  import {getContext} from 'svelte';
  import Button from '@components/button.svelte';

  const url = getContext('url');

  /** @type Array<{name: string, href: string, current?: boolean}> */
  export let items = [];

  for (const item of items) {
    if (!url) break;
    if (url.pathname === item.href) {
      item.current = true;
      continue;
    }
    // Ignore homepage matching everything
    if (item.href === '/' || url.pathname === '/') {
      continue;
    }
    // Match sub-pages
    if (url.pathname.startsWith(item.href)) {
      item.current = true;
      continue;
    }
  }
</script>

<ul class="Menu">
  {#each items as item}
    <li class="Menu__item">
      {#if item.button}
        <Button href={item.href} label={item.name} small />
      {:else}
        <a
          class="Menu__link"
          href={item.href}
          aria-current={item.current ? 'page' : undefined}
        >
          <span>{item.name}</span>
        </a>
      {/if}
    </li>
  {/each}
</ul>
