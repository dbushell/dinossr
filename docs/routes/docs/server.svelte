<script context="module">
  export const pattern = '/';
</script>

<script>
  import Layout from '@components/layout-docs.svelte';
  import Alert from '@components/docs-alert.svelte';
  import Pagination from '@components/pagination.svelte';
  import Code from '@components/code.svelte';

  const heading = 'Deno Server';
  const title = `DinoSsr - ${heading} (Documentation)`;
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<Layout>
  <h1>{heading}</h1>
  <Alert />
  <p>
    The <code>mod.ts</code> file at the root of the
    <a href="/docs/project-structure/">project</a> is the server entry point.
  </p>
  <Code
    language="javascript"
    code={`
import {DinoSsr} from 'dinossr';

const dir = new URL('./', import.meta.url).pathname;
const dinossr = new DinoServer(dir);
await dinossr.init();
`}
  />
  <p>This is started with: <code>deno run -A mod.ts</code>.</p>
  <p>
    Provide an optional directory path that for the project root. Either
    absolute or relative to <code>Deno.cwd()</code>. The current working
    directory is used as default.
  </p>
  <Pagination />
</Layout>
