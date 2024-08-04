import {DinoSsr} from 'jsr:@ssr/dinossr';

const dir = new URL('./', import.meta.url).pathname;

const dinossr = new DinoSsr(dir);

await dinossr.init();
