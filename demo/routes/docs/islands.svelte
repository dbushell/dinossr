<script context="module">
  import {highlight} from '@lib/highlight.js';

  export const pattern = '/';

  export const load = () => {
    return {
      code1: highlight(
        'svelte',
        `
<script>
  import {onMount} from 'svelte';
  import Island from '@dinossr/island';

  let time = '';
  const update = () => {
    time = new Date().toLocaleTimeString();
  };
  update();

  onMount(() => {
    setInterval(update, 1000);
  });
<\/script>

<Island>
  <time>{time}</time>
</Island>
`
      ),
      code2: highlight(
        'svelte',
        `
<script>
  import {onMount} from 'svelte';
  import Island from '@dinossr/island';

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

<Island props={{label}}>
  <time>
    {#if label}{label}{/if}
    <b>{time}</b>
  </time>
</Island>
`
      ),
      code3: highlight(
        'svelte',
        `
<Island props={$$props}>
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
  import DocsClock from '@components/docs-clock.svelte';
  import Code from '@components/code.svelte';

  const heading = 'Islands';
  const title = `DinoSsr - ${heading} (Documentation)`;

  const {code1, code2, code3} = getContext('data') ?? {};
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<Layout>
  <h1>{heading}</h1>
  <Alert />
  <p>DinoSsr renders server-side by default shipping no JavaScript.</p>
  <p>
    <strong>Islands</strong> are Svelte components that become interactive on the
    front-end. This is often referred to as "hydration" or "client-side render".
  </p>
  <p>
    To create an island import the <code>&lt;Island&gt;</code> component from
    <code>'@dinossr/island'</code>.
  </p>
  <p>Below in an example <code>clock.svelte</code> island component:</p>
  <Code language="svelte" code={code1} />
  <p>
    This can be imported and used as <code>&lt;Clock /&gt;</code> like a standard
    Svelte component.
  </p>
  <p>
    <code>&lt;Island&gt;</code> should be the only top-level element wrapping the
    entire component HTML.
  </p>
  <h2>Context and Props</h2>
  <p>
    Island components are rendered with the global <a href="/docs/context/"
      >route context</a
    >.
  </p>
  <p>
    Props passed from the parent must be passed to <code>&lt;Island&gt;</code>
    for them to render client-side.
  </p>
  <Code language="svelte" code={code2} />
  <p>Using <code>&lt;Clock /&gt;</code> will render:</p>
  <p>
    <DocsClock />
  </p>
  <p>Using <code>&lt;Clock label="The time is:" /&gt;</code> will render:</p>
  <p>
    <DocsClock label="The time is:" />
  </p>
  <p>
    All props can be passed with the <code>&#36;</code><code>&#36;props</code>
    shorthand (a special
    <a
      href="https://svelte.dev/docs/basic-markup#attributes-and-props"
      target="_blank">Svelte variable</a
    >).
  </p>
  <Code language="svelte" code={code3} />
  <p>Island prop values must be JSON serializable.</p>
  <p>
    If an island is nested within a parent island it will receive props like any
    other child component.
  </p>
  <Pagination />
</Layout>
