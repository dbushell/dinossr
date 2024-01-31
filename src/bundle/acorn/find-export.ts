import {acorn} from '../../../deps.ts';
import parseScript from './parse-script.ts';

/** Export does not exist in code */
export const undefinedExport = Symbol();

/** Return the named export node (or undefined symbol) */
export const findExport = (code: string, name: string) => {
  const ast = parseScript(code);
  for (const node of ast.body) {
    if (node.type !== 'ExportNamedDeclaration') {
      continue;
    }
    if (!node.declaration) {
      continue;
    }
    let identifier: acorn.Identifier | undefined;
    if (node.declaration.type === 'VariableDeclaration') {
      identifier = node.declaration.declarations[0].id as acorn.Identifier;
    } else if (node.declaration.type === 'FunctionDeclaration') {
      identifier = node.declaration.id as acorn.Identifier;
    } else if (node.declaration.type === 'ClassDeclaration') {
      identifier = node.declaration.id as acorn.Identifier;
    }
    if (!identifier || identifier.name !== name) {
      continue;
    }
    return node;
  }
  return undefinedExport;
};

/** Return the named export node value (or undefined symbol) */
export const findExportValue = (code: string, name: string) => {
  const node = findExport(code, name);
  if (
    node === undefinedExport ||
    node.declaration?.type !== 'VariableDeclaration' ||
    node.declaration.declarations[0].init?.type !== 'Literal'
  ) {
    return undefinedExport;
  }
  return node.declaration.declarations[0].init.value;
};
