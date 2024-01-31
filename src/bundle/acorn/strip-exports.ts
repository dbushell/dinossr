import {acorn} from '../../../deps.ts';
import parseScript from './parse-script.ts';
import parseExports from './parse-exports.ts';
import type {ParseExportMap} from '../types.ts';

export const stripExports = (
  code: string,
  exports: ParseExportMap,
  allowed: string[]
): string => {
  const parsed = parseExports(code);
  code = parsed.code;
  const ast = parseScript(code);
  // Negative offset to track removed code
  let offset = 0;
  // Invert export map to lookup local names
  const localMap = new Map<string, string>();
  exports.forEach((v, k) => localMap.set(v, k));
  for (const node of ast.body) {
    const locals: string[] = [];
    if (node.type === 'VariableDeclaration') {
      // TODO: handle multiple declarations?
      node.declarations.forEach((d) => {
        locals.push((d.id as acorn.Identifier).name);
      });
    } else if (node.type === 'FunctionDeclaration') {
      locals.push(node.id.name);
    } else if (node.type === 'ClassDeclaration') {
      locals.push(node.id.name);
    }
    for (const name of locals) {
      if (!localMap.has(name)) {
        continue;
      }
      if (allowed.includes(localMap.get(name)!)) {
        continue;
      }
      code =
        code.substring(0, node.start + offset) +
        code.substring(node.end + offset);
      offset -= node.end - node.start;
      break;
    }
  }
  return code;
};

export default stripExports;
