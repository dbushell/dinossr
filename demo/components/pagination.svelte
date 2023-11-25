<script>
  import {getContext} from 'svelte';
  import docs from '@lib/docs.json';
  import {docsIndex} from '@lib/helpers.js';

  const url = getContext('url');
  const index = docsIndex(docs, url);
</script>

<div class="Button-group">
  {#if index > 0}
    <a href={docs.pages[index - 1].href} class="Button Button--small">
      <span class="Button__label">← {docs.pages[index - 1].name}</span>
    </a>
  {/if}
  {#if index < docs.pages.length - 1}
    <a href={docs.pages[index + 1].href} class="Button Button--small">
      <span class="Button__label">{docs.pages[index + 1].name} →</span>
    </a>
  {/if}
</div>
