import {serve, ServeOptions} from '../mod.ts';
import tsconfig from './tsconfig.json' assert {type: 'json'};

const dir = new URL('./', import.meta.url).pathname;

const options: ServeOptions = {
  bumble: {
    typescript: {paths: tsconfig.compilerOptions.paths}
  }
};

serve(dir, options);
