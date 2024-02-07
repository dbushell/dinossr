<script context="module">
  import {highlight, highlightable} from '@lib/highlight.ts';
</script>

<script>
  export let language;
  export let code;

  const highlighted = highlightable(language);
  if (highlighted) {
    code = highlight(language, code);
  }
</script>

<pre class="Code"><code class="language-{language}"
    >{#if highlighted}{@html code}{:else}{code}{/if}</code
  ></pre>
