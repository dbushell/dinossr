import {path} from '../../../deps.ts';
import type {Metafile} from 'esbuild';

// Return Svelte component name from path
export const componentName = (entry: string) => {
  const ext = path.extname(entry);
  let name = path.basename(entry, ext);
  if (ext === '.svelte') {
    name = name
      .split('-')
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join('');
  }
  if (/^[0-9]+$/.test(name)) {
    name = `Component${name}`;
  }
  return name;
};

export const normalizeKey = (dir: string, key: string) => {
  // Ignore prefixed paths like `fetch:`
  if (/^.+?:/.test(key)) {
    return key;
  }
  // Check if WASM path or relative path
  let newKey = `/${key}`;
  if (!newKey.startsWith(dir)) {
    newKey = path.resolve(Deno.cwd(), `${key}`);
  }
  newKey = path.relative(dir, newKey);
  return newKey;
};

// Resolve all metafile paths to relative paths
// esbuild WASM resolves differently
export const normalizeMeta = (dir: string, oldMeta: Metafile) => {
  const newMeta: Metafile = {inputs: {}, outputs: {}};
  if (Object.hasOwn(newMeta, 'inputs')) {
    for (const [k, input] of Object.entries(oldMeta.inputs)) {
      const newInput = structuredClone(input);
      newMeta.inputs[normalizeKey(dir, k)] = newInput;
      for (const v2 of newInput.imports) {
        v2.path = normalizeKey(dir, v2.path);
      }
    }
    for (const [k, output] of Object.entries(oldMeta.outputs)) {
      const newOutput = structuredClone(output);
      newMeta.outputs[k] = newOutput;
      if (newOutput.entryPoint) {
        newOutput.entryPoint = normalizeKey(dir, newOutput.entryPoint);
      }
      for (const [k2, v2] of Object.entries(newOutput.inputs)) {
        delete newOutput.inputs[k2];
        newOutput.inputs[normalizeKey(dir, k2)] = v2;
      }
    }
  }
  return newMeta;
};

export const tagMatch = (tag: string) => {
  return new RegExp(`<${tag}(\\b[^>]*)>(.*?)<\\/${tag}>`, 'is');
};

export const tagExtract = (code: string, tags: Array<string>) => {
  const out: Array<string> = [];
  for (const tag of tags) {
    while (true) {
      const match = tagMatch(tag).exec(code);
      if (!match) break;
      code = code.replace(match[0], '');
      out.push(match[0]);
    }
  }
  return {code, out};
};
