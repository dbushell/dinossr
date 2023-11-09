<script context="module">
  import hljs from '@lib/hljs-core.min.js';
  import javascript from '@lib/hljs-javascript.min.js';
  hljs.registerLanguage('javascript', javascript);
</script>

<script>
  export let code;
  export let language;

  code = hljs.highlight(code.trim(), {language}).value;
</script>

<pre class="mb-4"><code
    class="language-{language} d-block bg-secondary-subtle p-4"
    >{@html code}</code
  ></pre>
