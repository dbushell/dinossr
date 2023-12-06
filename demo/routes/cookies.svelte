<script context="module" lang="ts">
  const colors = ['Red', 'Green', 'Blue'];

  export const post = async (request, response, {platform}) => {
    const body = await request.formData();
    const color = body.get('color')?.toString() ?? '';
    if (!colors.includes(color)) {
      return new Response(null, {status: 400});
    }
    platform.cookies.set('color', {
      value: color,
      path: '/cookies',
      httpOnly: true,
      sameSite: true
    });
    return new Response(null, {
      status: 302,
      headers: {
        location: new URL(request.url).pathname
      }
    });
  };

  export const load = (request, props) => {
    return {
      color: props.cookies.get('color')?.value ?? 'not selected'
    };
  };
</script>

<script lang="ts">
  import {getContext} from 'svelte';
  import Layout from '@components/layout.svelte';

  const {color} = getContext('data');

  const title = 'Cookies - DinoSsr Demo';
  const heading = 'Cookies';
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<Layout {title} {heading}>
  <p>This example sets a session cookie.</p>
  <p>Your color is: <strong>{color}</strong></p>
  <form method="POST">
    <label for="color">Select a color:</label>
    <select name="color">
      {#each colors as color}
        <option value={color}>{color}</option>
      {/each}
    </select>
    <input type="submit" value="Select" />
  </form>
  <p><a href="/">return home</a></p>
</Layout>
