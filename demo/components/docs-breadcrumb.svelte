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
