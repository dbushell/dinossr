<script context="module">
  import {highlight} from '@lib/highlight.js';

  export const pattern = '/';

  export const load = () => {
    return {
      code1: highlight(
        'javascript',
        `
import {DinoServer} from 'dinossr';

const dir = new URL('./', import.meta.url).pathname;
const dinossr = new DinoServer(dir);
await dinossr.init();
`
      ),
      code2: highlight(
        'javascript',
        `
dinossr.router.use((request, response) => {
  if (response) {
    response.headers.set('x-powered-by', 'DinoSsr');
  }
  return response;
});
`
      )
    };
  };
</script>

<script>
  import {getContext} from 'svelte';
  import Layout from '@components/layout-docs.svelte';
  import Alert from '@components/docs-alert.svelte';
  import Pagination from '@components/pagination.svelte';
  import Code from '@components/code.svelte';

  const heading = 'Deno Server';
  const title = `DinoSsr - ${heading} (Documentation)`;

  const {code1, code2} = getContext('data') ?? {};
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<Layout>
  <h1>{heading}</h1>
  <Alert />
  <p>
    The <code>mod.ts</code> file at the root of the project is the server entry point.
  </p>
  <Code language="javascript" code={code1} />
  <p>This is started with: <code>deno run -A mod.ts</code>.</p>
  <p>
    The <code>DinoServer</code> class provides access an instance of
    <a href="https://github.com/dbushell/velocirouter" target="_blank"
      >VelociRouter</a
    >.
  </p>
  <Code language="javascript" code={code2} />
  <p>
    Additional middleware and routes can be added or existing route responses
    modified.
  </p>
  <h2>Deno Deploy</h2>
  <p>
    DinoSsr is fully compatible with Deno Deploy. Isolate start-up times can be
    slow. There is still plenty of optimisation to do here!
  </p>
  <Pagination />
</Layout>
