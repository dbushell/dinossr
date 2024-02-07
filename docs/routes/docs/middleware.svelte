<script context="module">
  export const pattern = '/';
</script>

<script>
  import Layout from '@components/layout-docs.svelte';
  import Alert from '@components/docs-alert.svelte';
  import Pagination from '@components/pagination.svelte';
  import Code from '@components/code.svelte';

  const heading = 'Middleware';
  const title = `DinoSsr - ${heading} (Documentation)`;
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<Layout>
  <h1>{heading}</h1>
  <Alert />
  <p>
    Middleware can be added to <strong>DinoSsr</strong> by attaching
    <a href="/docs/velocirouter/">VelociRouter</a>
    handles to the internal <code>router</code> after initiating
    <a href="/docs/server/">the server</a>.
  </p>
  <h2>Before</h2>
  <p>
    <code>router.use</code> will attach the handle <strong>before</strong> any
    <a href="/docs/routing/">auto-generated routes</a>.
  </p>
  <Code
    language="javascript"
    code={`
dinossr.router.use(({request, response}) => {
  const pattern = new URLPattern('/api/:id/', request.url);
  const match = pattern.exec(request.url);
  if (match && request.method === 'GET') {
    return Response.json({id: match.pathname.groups.id});
  }
});
`}
  />
  <p>
    All requests will pass through a <code>use</code> handle.
  </p>
  <h2>After</h2>
  <p>
    Other methods like <code>router.get</code> require a pattern. These handles
    are attached <strong>after</strong> all auto-generated routes.
  </p>
  <Code
    language="javascript"
    code={`
dinossr.router.get('/api/*', ({response}) => {
  try {
    response.headers.set('x-api-version', '1.0');
  } catch { /* No response or immutable headers */ }
});
`}
  />
  <p>
    See the <a href="/docs/velocirouter/">VelociRouter documentation</a> for usage.
  </p>
  <p>Middleware is ideal for:</p>
  <ul>
    <li>Setting up the <a href="/docs/context/">context data</a> objects</li>
    <li>Handling API endpoints and <code>POST</code> requests</li>
    <li>Anything that requires large 3rd party libraries <sup>†</sup></li>
  </ul>
  <p><sup>†</sup> middleware is <a href="/docs/deploy/">never bundled</a>.</p>
  <Pagination />
</Layout>
