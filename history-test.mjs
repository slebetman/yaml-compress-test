import yaml from 'yaml';
import fs from 'fs';
import * as fflate from 'fflate';
import { toBase64 } from './lib/base64.mjs';
import * as jsondiffpatch from 'jsondiffpatch';

let rawEdits = [fs.readFileSync('./test_yamls/test.yaml','utf8')];

for (let i=0; i<=10; i++) {
	rawEdits.push(fs.readFileSync(`./test_yamls/edit${i}.yaml`,'utf8'));
}

const edits = rawEdits.map(x => yaml.parse(x));

console.log(edits.map(x => JSON.stringify(x).length));



// const jsonDiff = JSON.stringify(jsondiffpatch.diff(obj, obj2)) || '';
// const jsonCompressed2 = toBase64(fflate.deflateSync(Uint8Array.from(jsonDiff)));

