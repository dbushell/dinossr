import {acorn} from '../../../deps.ts';
import parseScript from './parse-script.ts';
import type {ParseExportMap} from '../types.ts';

const parseExports = (code: string): {code: string; map: ParseExportMap} => {
  const ast = parseScript(code);
  const map: ParseExportMap = new Map();
  // Negative offset to track removed code
  let offset = 0;
  // Loop through all export statements
  for (const node of ast.body) {
    if (!node.type.startsWith('Export')) {
      continue;
    }
    const removeNode = () => {
      code =
        code.substring(0, node.start + offset) +
        code.substring(node.end + offset);
      offset -= node.end - node.start;
    };
    // Handle default exports
    if (node.type === 'ExportDefaultDeclaration') {
      removeNode();
      if (node.declaration.type !== 'Identifier') {
        throw new Error('Unsupported ExportDefaultDeclaration');
      }
      map.set('default', (node.declaration as acorn.Identifier).name);
      continue;
    }
    // Handle named exports
    if (node.type === 'ExportNamedDeclaration') {
      // Handle declarations
      if (node.declaration) {
        let identifier: acorn.Identifier | undefined;
        if (node.declaration.type === 'VariableDeclaration') {
          identifier = node.declaration.declarations[0].id as acorn.Identifier;
        } else if (node.declaration.type === 'FunctionDeclaration') {
          identifier = node.declaration.id as acorn.Identifier;
        } else if (node.declaration.type === 'ClassDeclaration') {
          identifier = node.declaration.id as acorn.Identifier;
        }
        if (!identifier) {
          throw new Error('Unsupported ExportNamedDeclaration');
        }
        map.set(identifier.name, identifier.name);
        // Remove just the "export" keyword
        const length = node.declaration.start - node.start;
        code =
          code.substring(0, node.start + offset) +
          code.substring(node.declaration.start + offset);
        offset -= length;
      }
      // Handle specifiers
      else if (node.specifiers) {
        removeNode();
        for (const specifier of node.specifiers) {
          if (specifier.exported.type !== 'Identifier') {
            console.warn('Unsupported ExportNamedDeclaration');
          }
          if (specifier.local.type !== 'Identifier') {
            console.warn('Unsupported ExportNamedDeclaration');
          }
          map.set(
            (specifier.exported as acorn.Identifier).name,
            (specifier.local as acorn.Identifier).name
          );
        }
      }
      continue;
    }
    // Handle all exports
    if (node.type === 'ExportAllDeclaration') {
      throw new Error('Unsupported ExportAllDeclaration');
    }
    throw new Error('Unsupported Export');
  }
  return {code, map};
};

export default parseExports;
