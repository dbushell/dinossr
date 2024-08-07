import * as acorn from 'acorn';
import {encodeHash} from '../../utils.ts';

const parseMap = new Map<string, acorn.Program>();

const parseScript = async (code: string) => {
  const hash = await encodeHash(code);
  if (parseMap.has(hash)) return parseMap.get(hash)!;
  const ast = acorn.parse(code, {sourceType: 'module', ecmaVersion: 'latest'});
  parseMap.set(hash, ast);
  return ast;
};

export default parseScript;
