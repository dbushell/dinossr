<script lang="ts">
  import Header from '@components/header.svelte';
  import Footer from '@components/footer.svelte';
  import Main from '@components/main.svelte';

  export let title = 'DinoSsr Demo';
  export let heading = 'Hello, World!';

  const footerItems = [
    {
      name: 'David Bushell',
      href: 'https://dbushell.com'
    },
    {
      name: 'GitHub',
      href: 'https://github.com/dbushell/dinossr'
    }
  ];
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<Header {heading} />
<Main>
  <slot />
</Main>
<Footer menu={footerItems} />
