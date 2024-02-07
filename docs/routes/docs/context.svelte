<script context="module">
  export const pattern = '/';
</script>

<script>
  import Layout from '@components/layout-docs.svelte';
  import Alert from '@components/docs-alert.svelte';
  import Pagination from '@components/pagination.svelte';
  import Code from '@components/code.svelte';

  const heading = 'Context';
  const title = `DinoSsr - ${heading} (Documentation)`;
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<Layout>
  <h1>{heading}</h1>
  <Alert />
  <p>
    Routes are rendered with access to a global Svelte context. Context data is
    also accessible from any child component.
  </p>
  <Code
    language="svelte"
    code={`
<script>
  import {getContext} from 'svelte';
  const url = getContext('url');
<\/script>

<p>The current page is: <code>{url.pathname}</code></p>
`}
  />
  <p>Available context properties are:</p>
  <h3><code>url</code></h3>
  <p>An instance of <code>URL</code> for the current route.</p>
  <h3><code>pattern</code></h3>
  <p>The URL Pattern pathname of the current route.</p>
  <h3><code>params</code></h3>
  <p>An object of any URL Pattern matches.</p>
  <h3><code>browser</code></h3>
  <p>
    <code>true</code> if component is an
    <a href="/docs/islands/">Island</a> else <code>undefined</code>.
  </p>
  <h3><code>publicData</code></h3>
  <p>
    An object for which custom route data is assigned. This data will be
    available
    <strong>both</strong> server-side and client-side.
  </p>
  <h3><code>serverData</code></h3>
  <p>
    Like <code>publicData</code> but available <strong>only</strong> server-side.
  </p>
  <p>Context data should be JSON serializable.</p>
  <Pagination />
</Layout>
available
