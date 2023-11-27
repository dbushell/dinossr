import hljs from 'https://esm.sh/highlight.js@11.9.0/lib/core.js?target=esnext';
import xml from 'https://esm.sh/highlight.js@11.9.0/lib/languages/xml.js?target=esnext';
import javascript from 'https://esm.sh/highlight.js@11.9.0/lib/languages/javascript.js?target=esnext';
/* esm.sh - esbuild bundle(highlightjs-svelte@1.0.6) es2022 production */
function svelte(e){return{subLanguage:"xml",contains:[e.COMMENT("<!--","-->",{relevance:10}),{begin:/^(\s*)(<script(\s*context="module")?>)/gm,end:/^(\s*)(<\/script>)/gm,subLanguage:"javascript",excludeBegin:!0,excludeEnd:!0,contains:[{begin:/^(\s*)(\$:)/gm,end:/(\s*)/gm,className:"keyword"}]},{begin:/^(\s*)(<style.*>)/gm,end:/^(\s*)(<\/style>)/gm,subLanguage:"css",excludeBegin:!0,excludeEnd:!0},{begin:/\{/gm,end:/\}/gm,subLanguage:"javascript",contains:[{begin:/[\{]/,end:/[\}]/,skip:!0},{begin:/([#:\/@])(if|else|each|await|then|catch|debug|html)/gm,className:"keyword",relevance:10}]}]}}

hljs.registerLanguage('xml', xml);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('svelte', svelte);

export const highlight = (language, code) => {
  code = hljs.highlight(code.trim(), {language}).value;
  // TODO: why does `$$` get replaced with a single `$`?
  code = code.replaceAll('$', '&#36;');
  return code;
};
