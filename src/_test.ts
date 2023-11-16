import * as path from 'https://deno.land/std@0.206.0/path/mod.ts';
import * as acorn from 'npm:acorn@8.11.2';

const dir = new URL('./', import.meta.url).pathname;

const traverse = async (dir: string, depth = 0): Promise<string[]> => {
  // TODO: provide option to override?
  if (depth >= 10) {
    throw new Error('Exceeded maximum depth for static directory');
  }
  let routes: string[] = [];
  for await (const entry of Deno.readDir(dir)) {
    // Ignore hidden files
    if (['.', '_'].includes(entry.name.at(0)!)) {
      continue;
    }
    if (entry.isDirectory) {
      routes = routes.concat(
        await traverse(path.join(dir, entry.name), depth + 1)
      );
      continue;
    }
    if (!entry.isFile) {
      continue;
    }
    if (!entry.name.endsWith('.js')) {
      continue;
    }
    routes.push(path.join(dir, entry.name));
  }
  return routes;
};

const entries = await traverse(path.join(dir, 'svelte@4.2.3'));

entries.forEach((entry) => {
  try {
    let code = Deno.readTextFileSync(entry);
    const ast = acorn.parse(code, {
      sourceType: 'module',
      ecmaVersion: 'latest'
    });
    let offset = 0;
    let head = '';
    for (const node of ast.body) {
      if (!node.type.startsWith('Export')) {
        continue;
      }
      if (node.type === 'ExportAllDeclaration') {
        if (!node.source) {
          throw new Error('no source');
        }
        if (node.exported && node.exported.type !== 'Identifier') {
          throw new Error('unknown exported');
        }
        code =
          code.substring(0, node.start + offset) +
          code.substring(node.end + offset);
        offset -= node.end - node.start;
        const map: Map<string, string> = new Map();
        const srcEntry = path.resolve(
          path.dirname(entry),
          node.source.value as string
        );
        const srcCode = Deno.readTextFileSync(srcEntry);
        const srcAst = acorn.parse(srcCode, {
          sourceType: 'module',
          ecmaVersion: 'latest'
        });
        for (const srcNode of srcAst.body) {
          if (!srcNode.type.startsWith('Export')) {
            continue;
          }
          if (srcNode.type === 'ExportAllDeclaration') {
            continue;
          }
          // Handle named exports
          if (srcNode.type === 'ExportNamedDeclaration') {
            // Handle declarations
            if (srcNode.declaration) {
              let identifier: acorn.Identifier | undefined;
              if (srcNode.declaration.type === 'VariableDeclaration') {
                identifier = srcNode.declaration.declarations[0]
                  .id as acorn.Identifier;
              } else if (srcNode.declaration.type === 'FunctionDeclaration') {
                identifier = srcNode.declaration.id as acorn.Identifier;
              } else if (srcNode.declaration.type === 'ClassDeclaration') {
                identifier = srcNode.declaration.id as acorn.Identifier;
              }
              if (!identifier) {
                throw new Error('Unsupported ExportNamedDeclaration');
              }
              map.set(identifier.name, identifier.name);
            }
            // Handle specifiers
            else if (srcNode.specifiers) {
              for (const specifier of srcNode.specifiers) {
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
          throw new Error(`Unsupported node type ${srcNode.type}`);
        }

        if (node?.exported?.type === 'Identifier') {
          const prefix = node.exported.name;
          const aliasMap = new Map<string, string>();
          const parts = [];
          for (const [alias, name] of map) {
            const key = `${prefix}_${name}`;
            parts.push(`${name} as ${key}`);
            aliasMap.set(key, alias ?? name);
          }
          head += `import { ${parts.join(', ')} } from "${
            node.source.value
          }";\n`;
          const parts2 = [];
          for (const [key, alias] of aliasMap) {
            parts2.push(`${alias}: ${key}`);
          }
          head += `export const ${node.exported.name} = { ${parts2.join(
            ', '
          )} };\n`;
        } else {
          const parts = [];
          for (const [alias, name] of map) {
            parts.push(alias === name ? name : `${name} as ${alias}`);
          }
          head += `export { ${parts.join(', ')} } from "${
            node.source.value
          }";\n`;
        }
      }
    }
    if (head) {
      code = (head + code).replace(/\n+/g, '\n');
      console.log(`Updated ${entry}`);
      Deno.writeTextFileSync(entry, code);
    }
  } catch (err) {
    console.log(err);
    console.log(entry);
  }
});
