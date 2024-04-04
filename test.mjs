import yaml from 'yaml';
import fs from 'fs';
import createPatch from 'textdiff-create';
import * as fflate from 'fflate';
import { fromBase64, toBase64 } from './lib/base64.mjs';
import * as jsondiffpatch from 'jsondiffpatch';

const raw = fs.readFileSync('./test_yamls/test.yaml','utf8');
const raw2 = fs.readFileSync('./test_yamls/edit0.yaml','utf8');
const obj = yaml.parse(raw);
const obj2 = yaml.parse(raw2);
const json = JSON.stringify(obj);
const json2 = JSON.stringify(obj2);

const diff = JSON.stringify(createPatch(json, json2));
const jsonDiff = JSON.stringify(jsondiffpatch.diff(obj, obj2)) || '';

const yamlCompressed = toBase64(fflate.deflateSync(fflate.strToU8(raw)));
const jsonCompressed = toBase64(fflate.deflateSync(fflate.strToU8(json)));
const jsonCompressed2 = toBase64(fflate.deflateSync(fflate.strToU8(jsonDiff)));
const diffCompressed = toBase64(fflate.deflateSync(fflate.strToU8(diff)));

console.log(`
YAML size: ${raw.length}
JSON size: ${json.length}
JSON2 size: ${json2.length}
DIFF size: ${diff.length}
JSON DIFF size: ${jsonDiff.length}
DIFF compressed size: ${diffCompressed.length} -> ${diffCompressed}
JSON DIFF compressed size: ${jsonCompressed2.length} -> ${jsonCompressed2}
YAML compressed size: ${yamlCompressed.length}
JSON compressed size: ${jsonCompressed.length}
`);

const decodedJson = fflate.strFromU8(fflate.inflateSync(fromBase64(jsonCompressed)));

// console.log(decodedJson);