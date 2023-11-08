<script>
  import {getContext} from 'svelte';
  import docs from '@lib/docs.json';
  import {docsIndex} from '@lib/helpers.ts';

  /** @type {URL} */
  const url = getContext('url');
  const index = docsIndex(docs, url);
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
