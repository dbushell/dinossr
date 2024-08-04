import parseScript from './parse-script.ts';
import type {ParseImportMap} from '../types.ts';
import type {Identifier} from 'acorn';

const parseImports = async (
  code: string
): Promise<{code: string; map: ParseImportMap}> => {
  const ast = await parseScript(code);
  const map: ParseImportMap = new Map();
  // Negative offset to track removed code
  let offset = 0;
  // Loop through all import statements
  for (const node of ast.body) {
    if (node.type !== 'ImportDeclaration') {
      continue;
    }
    // Remove import statement
    code =
      code.substring(0, node.start + offset) +
      code.substring(node.end + offset);
    offset -= node.end - node.start;
    // Setup import map
    const from = map.get(node.source.value as string) ?? [];
    map.set(node.source.value as string, from);
    // Loop through named imports
    for (const specifier of node.specifiers) {
      // Handle default imports
      if (specifier.type === 'ImportDefaultSpecifier') {
        from.push({
          alias: 'default',
          local: specifier.local.name
        });
        continue;
      }
      // Handle namespace imports
      if (specifier.type === 'ImportNamespaceSpecifier') {
        from.push({
          alias: '*',
          local: specifier.local.name
        });
        continue;
      }
      // Handle named imports (type: ImportSpecifier)
      if (specifier.imported.type === 'Identifier') {
        from.push({
          alias: (specifier.imported as Identifier).name,
          local: specifier.local.name
        });
        continue;
      } else {
        console.warn('Unsupported ImportSpecifier Literal');
      }
      throw new Error('Unsupported Import');
    }
  }
  return {code, map};
};

export default parseImports;
