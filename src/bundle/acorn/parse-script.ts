import {acorn} from '../../../deps.ts';
import {encodeHash} from '../../utils.ts';

const parseMap = new Map<string, acorn.Program>();

const parseScript = (code: string) => {
  const hash = encodeHash(code);
  if (parseMap.has(hash)) return parseMap.get(hash)!;
  const ast = acorn.parse(code, {sourceType: 'module', ecmaVersion: 'latest'});
  parseMap.set(hash, ast);
  return ast;
};

export default parseScript;
