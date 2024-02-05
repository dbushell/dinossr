<script context="module">
  export const get = () => {
    console.log('GET /missing');
    return null;
  };
</script>

<p>This route should return 404.</p>
