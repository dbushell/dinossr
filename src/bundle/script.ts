import {path} from '../../deps.ts';
import {parseExports, parseImports, stripExports} from './mod.ts';
import type {ParseExportMap, ParseImportMap} from './types.ts';

const supportedExtensions = ['.svelte', '.ts', '.js', '.json'];

interface CodeOptions {
  exports?: boolean | Array<string>;
  exportType: 'module' | 'function';
}

export default class Script {
  #code: string;
  #imports!: ParseImportMap;
  #exports!: ParseExportMap;

  constructor(code: string) {
    this.#code = code;
  }

  async parse() {
    ({code: this.#code, map: this.#imports} = await parseImports(this.#code));
    ({code: this.#code, map: this.#exports} = await parseExports(this.#code));
  }

  get imports(): ParseImportMap {
    return this.#imports;
  }

  get exports(): ParseExportMap {
    return this.#exports;
  }

  /** Combine all (or specific) exports into one `export` statement */
  serializeModule(exports?: CodeOptions['exports']): string {
    if (exports === false) return 'export {};';
    const parts = [];
    for (const [alias, name] of this.#exports) {
      if (
        exports === true ||
        (Array.isArray(exports) && exports.includes(alias))
      ) {
        parts.push(alias === name ? name : `${name} as ${alias}`);
      }
    }
    return `export { ${parts.join(', ')} };`;
  }

  /** Combine all (or specific) exports into one `return` statement */
  serializeFunction(exports?: CodeOptions['exports']): string {
    if (exports === false) return 'return {};';
    const parts = [];
    for (const [alias, name] of this.#exports) {
      if (
        exports === true ||
        (Array.isArray(exports) && exports.includes(alias))
      ) {
        parts.push(alias === name ? name : `${alias} : ${name}`);
      }
    }
    return `return { ${parts.join(', ')} };`;
  }

  /** Serialize script with optional exports */
  async serialize(
    options: CodeOptions = {exportType: 'module'}
  ): Promise<string> {
    let code = this.#code;
    if (Array.isArray(options.exports)) {
      code = await stripExports(code, this.#exports, options.exports);
    }
    if (options.exports) {
      if (options.exportType === 'module') {
        code += `\n${this.serializeModule(options.exports)}\n`;
      }
      if (options.exportType === 'function') {
        code += `\n${this.serializeFunction(options.exports)}\n`;
      }
    }
    return code;
  }

  static supportedType(entry: string): boolean {
    const ext = path.extname(entry);
    return supportedExtensions.includes(ext);
  }
}
