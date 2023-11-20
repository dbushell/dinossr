import hljs from '@lib/hljs-core.min.js';
import xml from '@lib/hljs-xml.min.js';
import javascript from '@lib/hljs-javascript.min.js';
import svelte from '@lib/hljs-svelte.min.js';

hljs.registerLanguage('xml', xml);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('svelte', svelte);

export const highlight = (language, code) => {
  code = hljs.highlight(code.trim(), {language}).value;
  // TODO: why does `$$` get replaced with a single `$`?
  code = code.replaceAll('$', '&#36;');
  return code;
};
