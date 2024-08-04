import parseScript from './parse-script.ts';
import type {
  ExportNamedDeclaration,
  Identifier,
  VariableDeclaration
} from 'acorn';

/** Export does not exist in code */
export const undefinedExport = Symbol();

/** Return the named export node (or undefined symbol) */
export const findExport = async (
  code: string,
  name: string
): Promise<symbol | ExportNamedDeclaration> => {
  const ast = await parseScript(code);
  // Possibly defined before exported in two statements
  let constNode: VariableDeclaration | undefined;
  for (const node of ast.body) {
    // Look for `const [name] = true;`
    if (node.type === 'VariableDeclaration' && node.kind === 'const') {
      const declarator = node.declarations[0];
      if (
        declarator?.init?.type === 'Literal' &&
        declarator.id.type === 'Identifier' &&
        declarator.id.name === name
      ) {
        constNode = node;
      }
      continue;
    }
    if (node.type !== 'ExportNamedDeclaration') {
      continue;
    }
    if (!node.declaration) {
      if (!constNode) continue;
      // Check for pre-defined const export
      for (const specifier of node.specifiers) {
        if (
          specifier.exported.type === 'Identifier' &&
          specifier.exported.name === name
        ) {
          // Create fake export node
          return {
            type: 'ExportNamedDeclaration',
            start: 0,
            end: 0,
            declaration: constNode,
            specifiers: [],
            source: null
          };
        }
      }
      continue;
    }
    let identifier: Identifier | undefined;
    if (node.declaration.type === 'VariableDeclaration') {
      identifier = node.declaration.declarations[0].id as Identifier;
    } else if (node.declaration.type === 'FunctionDeclaration') {
      identifier = node.declaration.id as Identifier;
    } else if (node.declaration.type === 'ClassDeclaration') {
      identifier = node.declaration.id as Identifier;
    }
    if (!identifier || identifier.name !== name) {
      continue;
    }
    return node;
  }
  return undefinedExport;
};

/** Return the named export node value (or undefined symbol) */
export const findExportValue = async (code: string, name: string) => {
  const node = await findExport(code, name);
  if (typeof node === 'symbol') return node;
  if (
    node.declaration?.type !== 'VariableDeclaration' ||
    node.declaration.declarations[0].init?.type !== 'Literal'
  ) {
    return undefinedExport;
  }
  return node.declaration.declarations[0].init.value;
};
