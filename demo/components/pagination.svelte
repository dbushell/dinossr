<script>
  import {getContext} from 'svelte';
  import {docs} from '@lib/data.json';
  import {docsIndex} from '@lib/helpers.js';

  const url = getContext('url');
  const index = docsIndex(docs.menu, url);
</script>

<div class="Button-group">
  {#if index > 0}
    <a href={docs.menu[index - 1].href} class="Button Button--small">
      <span class="Button__label">← {docs.menu[index - 1].name}</span>
    </a>
  {/if}
  {#if index < docs.menu.length - 1}
    <a href={docs.menu[index + 1].href} class="Button Button--small">
      <span class="Button__label">{docs.menu[index + 1].name} →</span>
    </a>
  {/if}
</div>
