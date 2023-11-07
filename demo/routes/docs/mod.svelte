<script>
  import {setContext} from 'svelte';
  import Layout from '@components/layout.svelte';

  /** @type {URL} */
  export let url;

  setContext('url', url);

  const heading = 'Documentation';
  const title = `DinoSrr - ${heading}`;
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<Layout>
  <h1>{heading}</h1>
  <p class="lead">
    DinoSsr is an experimental work in progress and subject to change.
  </p>
  <div class="mb-4">
    <ul class="nav flex-column mb-4">
      <li class="nav-item">
        <a class="nav-link" href="/docs/structure/">
          <span>→ Project Structure</span>
        </a>
        <a class="nav-link" href="/docs/server/">
          <span>→ Deno Server</span>
        </a>
      </li>
    </ul>
  </div>
  <div class="mb-4 d-flex align-items-center justify-content-between">
    <a href="/docs/structure/" class="btn btn-small btn-outline-info">
      <span>Project Structure →</span>
    </a>
  </div>
</Layout>
