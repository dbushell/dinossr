<script context="module">
  export const pattern = '/';
</script>

<script>
  import {getContext} from 'svelte';
  import Layout from '@components/layout-docs.svelte';
  import Alert from '@components/docs-alert.svelte';
  import Pagination from '@components/pagination.svelte';
  import DocsClock from '@components/docs-clock.svelte';
  import Code from '@components/code.svelte';

  const heading = 'Islands';
  const title = `DinoSsr - ${heading} (Documentation)`;
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<Layout>
  <h1>{heading}</h1>
  <Alert />
  <p>
    <strong>DinoSsr</strong> renders server-side by default shipping no JavaScript.
  </p>
  <p>
    <strong>Islands</strong> are Svelte components that become interactive in the
    browser. This is often referred to as "hydration" or "client-side render".
  </p>
  <p>
    To create an Island add <code>export const island = true;</code> to the module
    script.
  </p>
  <p>Below in an example <code>clock.svelte</code> Island component:</p>
  <Code language="svelte" code={`
<script context="module">
  export const island = true;
<\/script>

<script>
  import {onMount} from 'svelte';

  export let label = '';

  let time = '';
  const update = () => {
    time = new Date().toLocaleTimeString();
  };
  update();

  onMount(() => {
    setInterval(update, 1000);
  });
<\/script>

<time>
  {#if label}{label}{/if}
  <b>{time}</b>
</time>
`} />
  <p>
    This can be imported and used as <code>&lt;Clock /&gt;</code> like a standard
    Svelte component.
  </p>
  <p>Using <code>&lt;Clock /&gt;</code> will render:</p>
  <p>
    <DocsClock />
  </p>
  <p>Using <code>&lt;Clock label="The time is:" /&gt;</code> will render:</p>
  <p>
    <DocsClock label="The time is:" />
  </p>
  <h2>Context and Props</h2>
  <p>
    Island components are rendered with the global <a href="/docs/context/"
      >route context</a
    >
    (except <code>serverData</code>).
  </p>
  <p>
    Island prop values must be JSON serializable. If an Island is nested within
    a parent Island it will receive props like any other child component.
  </p>
  <Pagination />
</Layout>
