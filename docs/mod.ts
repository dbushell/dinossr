import {DinoSsr, type DinoManifest} from 'jsr:@ssr/dinossr@0.31';

const dir = new URL('./', import.meta.url).pathname;

let manifest: DinoManifest | undefined;
if (Deno.env.has('DENO_REGION')) {
  manifest = await import('file:///src/.dinossr/manifest.js');
}

const dinossr = new DinoSsr(dir, {
  manifest
});

await dinossr.init();
