<script>
  import docs from '@data/docs.json';
  import {getContext} from 'svelte';

  /** @type {URL} */
  const url = getContext('url');

  let index = 0;
  for (let i = 0; i < docs.pages.length; i++) {
    if (docs.pages[i].href === url?.pathname) {
      index = i;
      break;
    }
  }
</script>

<div class="mb-4 d-flex align-items-center justify-content-between">
  {#if index > 0}
    <a href={docs.pages[index - 1].href} class="btn btn-small btn-outline-info">
      <span>← {docs.pages[index - 1].name}</span>
    </a>
  {/if}
  {#if index < docs.pages.length - 1}
    <a href={docs.pages[index + 1].href} class="btn btn-small btn-outline-info">
      <span>{docs.pages[index + 1].name} →</span>
    </a>
  {/if}
</div>
