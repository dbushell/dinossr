import type {BumbleBundle, BumbleModule} from './types.ts';

/** Import bundle from a blob URL */
export const importDynamicBundle = async <M>(
  bundle: BumbleBundle,
  exports: boolean | Array<string> = true
): Promise<BumbleModule<M>> => {
  const {script} = bundle;
  const code = script.serialize({
    exports,
    exportType: 'module'
  });
  const blob = new Blob([code], {type: 'text/javascript'});
  const url = URL.createObjectURL(blob);
  const mod = await import(url);
  URL.revokeObjectURL(url);
  return mod;
};

/** Evaluate bundle in a function that returns the exports */
export const importFunctionBundle = <M>(
  bundle: BumbleBundle,
  exports: boolean | Array<string> = true
): Promise<BumbleModule<M>> => {
  const {script} = bundle;
  const code = script.serialize({
    exports,
    exportType: 'function'
  });
  return Function(`'use strict';\n${code}`)();
};

/** Import module bundle */
export const importBundle = <M>(
  bundle: BumbleBundle,
  dynamicImports: boolean,
  exports: boolean | Array<string> = true
): Promise<BumbleModule<M>> => {
  if (dynamicImports) {
    return importDynamicBundle<M>(bundle, exports);
  }
  return importFunctionBundle<M>(bundle, exports);
};
