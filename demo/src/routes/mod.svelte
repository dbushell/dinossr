<script context="module">
  export const csr = true;
</script>

<script lang="ts">
  import {onMount, setContext} from 'svelte';
  import Layout from '@components/layout.svelte';
  import Alert from '@components/alert.svelte';
  import Card from '@components/card.svelte';
  import Rule from '@components/rule.svelte';

  export let url: URL;
  setContext('url', url);

  const title = 'DinoSrr';
  const heading = 'DinoSrr';

  onMount(() => {
    console.log('mounted');
  });
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<Layout>
  <h1>{heading} <sup class="fs-6 badge text-bg-info">Alpha</sup></h1>
  <p class="lead mb-5">
    A minimal web framework built for Deno and Deno Deploy.
  </p>
  <div class="row row-gap-4 mb-4">
    <div class="col col-12 col-md-6 col-lg-4">
      <h2 class="fw-light text-info-emphasis">SSR First</h2>
      <p>
        Pages are rendered server side with Svelte components or JavaScript
        functions.
      </p>
    </div>
    <div class="col col-12 col-md-6 col-lg-4">
      <h2 class="fw-light text-info-emphasis">No Build</h2>
      <p>Just-in-time rendering with no build step.</p>
    </div>
    <div class="col col-12 col-md-6 col-lg-4">
      <h2 class="fw-light text-info-emphasis">Routing</h2>
      <p>File system and <code>URLPattern</code> based routes.</p>
    </div>
  </div>
  <Alert />
  <Rule />
  <h2 class="h3 text-secondary">Powered by...</h2>
  <p>DinoSrr is built upon these projects:</p>
  <div class="row row-gap-4 my-4">
    <div class="col col-12 col-md-5 col-lg-4">
      <Card
        title="VelociRouter"
        text="A minimal async Request → Response router powered by URL Pattern API magic ✨"
        link="https://github.com/dbushell/velocirouter"
        linkText="GitHub"
      />
    </div>
    <div class="col col-12 col-md-5 col-lg-4">
      <Card
        title="Svelte Bumble"
        text="An experimental just-in-time Svelte + TypeScript module bundler and importer ✨"
        link="https://github.com/dbushell/svelte-bumble"
        linkText="GitHub"
      />
    </div>
  </div>
</Layout>
