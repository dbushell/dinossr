<script context="module">
  export const pattern = '/';
</script>

<script>
  import Layout from '@components/layout-docs.svelte';
  import Alert from '@components/docs-alert.svelte';
  import Pagination from '@components/pagination.svelte';
  import Code from '@components/code.svelte';

  const heading = 'Loading Data';
  const title = `DinoSsr - ${heading} (Documentation)`;
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<Layout>
  <h1>{heading}</h1>
  <Alert />
  <p>
    <a href="/docs/routing/">Svelte routes</a> can export a <code>load</code>
    function from the module script. This function is used to fetch and add
    <a href="/docs/context/">context data</a> for the current page.
  </p>
  <Code
    language="svelte"
    code={`
<script context="module">
  export const pattern = '/:id(\\d+)/';

  export function load ({params, fetch, publicData}) {
    const response = await fetch(\`https://example/api/\${params.id}\`);
    const data = response.json();
    publicData.user = {
      name: \`\${data.firstName} \${data.lastName}\`
    };
  }
<\/script>
`}
  />
  <p>
    Child components do not have a load function but they can access the same
    global context for the page they’re used.
  </p>
  <p>The <code>load</code> function receives an object with the properties:</p>
  <h3><code>params</code></h3>
  <p>An object of any URL Pattern matches.</p>
  <h3><code>fetch</code></h3>
  <p>
    A function that proxies the global <code>fetch</code> allowing
    <strong>relative</strong> URLs to be handled by
    <a href="/docs/middleware/">middleware</a>
    and not remotely. URLs prefixed with <code>ORIGIN</code> are also handled
    internally (see
    <a href="/docs/environment-variables/">environment variables</a>).
  </p>
  <h3><code>publicData</code></h3>
  <p>An object to read and assign <a href="/docs/context/">context data</a>.</p>
  <h3><code>serverData</code></h3>
  <p>An object to read and assign <a href="/docs/context/">context data</a>.</p>
  <h3>Advanced Properties</h3>
  <p>
    Properties from <code>platform</code> in
    <a href="/docs/advanced-routes/">advanced routes</a> are also available.
  </p>
  <h2>Return value</h2>
  <p>
    The <code>load</code> function can return an optional <code>Response</code>.
    This replaces the Svelte template which is never rendered.
  </p>
  <Pagination />
</Layout>
