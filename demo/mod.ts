import {DinoServer} from 'https://raw.githubusercontent.com/dbushell/dinossr/v0.10.2/mod.ts';

const dir = new URL('./', import.meta.url).pathname;

const dinossr = new DinoServer(dir);

await dinossr.init();
