<script>
  import {getContext} from 'svelte';
  import docs from '@lib/docs.json';
  import {docsIndex} from '@lib/helpers.ts';

  /** @type {URL} */
  const url = getContext('url');
  const index = docsIndex(docs, url);
</script>

<nav aria-label="breadcrumb">
  <ol class="breadcrumb">
    <li class="breadcrumb-item">
      <a href={docs.pages[0].href}>{docs.pages[0].name}</a>
    </li>
    {#if index > 0}
      <li class="breadcrumb-item active" aria-current="page">
        <span>{docs.pages[index].name}</span>
      </li>
    {/if}
  </ol>
</nav>
