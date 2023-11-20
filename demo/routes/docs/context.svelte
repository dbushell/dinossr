<script context="module">
  import {highlight} from '@lib/highlight.js';

  export const pattern = '/';

  export const load = () => {
    return {
      code1: highlight(
        'svelte',
        `
<script>
  import {getContext} from 'svelte';
  const url = getContext('url');
<\/script>

<p>The current page is: <code>{url.pathname}</code></p>
`
      )
    };
  };
</script>

<script>
  import {getContext} from 'svelte';
  import Layout from '@components/layout.svelte';
  import DocsBreadcrumb from '@components/docs-breadcrumb.svelte';
  import DocsNav from '@components/docs-nav.svelte';
  import Code from '@components/code.svelte';

  const heading = 'Context';
  const title = `DinoSrr - ${heading} (Documentation)`;

  const {code1} = getContext('data') ?? {};
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<Layout>
  <h1>{heading}</h1>
  <DocsBreadcrumb />
  <div class="mb-4">
    <p>
      Routes are rendered with access to a global Svelte context accessible from
      any child component.
    </p>
    <Code language="svelte" code={code1} />
    <p>Available context properties are:</p>
    <h3><code>url</code></h3>
    <p>An instance of <code>URL</code> for the current route.</p>
    <h3><code>pattern</code></h3>
    <p>The URL Pattern pathname of the current route.</p>
    <h3><code>params</code></h3>
    <p>An object of any URL Pattern matches.</p>
    <h3><code>browser</code></h3>
    <p>
      <code>undefined</code>; or <code>true</code> if component is a
      <a href="/docs/islands">client-side Island</a>.
    </p>
  </div>
  <DocsNav />
</Layout>
