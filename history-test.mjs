import yaml from 'yaml';
import fs from 'fs';
import * as history from './lib/history.mjs';

let rawEdits = [fs.readFileSync('./test_yamls/test.yaml', 'utf8')];

for (let i = 0; i <= 10; i++) {
	rawEdits.push(fs.readFileSync(`./test_yamls/edit${i}.yaml`, 'utf8'));
}

const edits = rawEdits.map((x) => yaml.parse(x));

console.log(
	'YAML sizes',
	rawEdits.map((x) => x.length)
);

console.log(
	'JSON sizes',
	edits.map((x) => JSON.stringify(x).length)
);

for (const e of edits) {
	history.addHistory(e);
}

console.log(
	'History sizes',
	history.editHistory.map((x) => x.length)
);

console.log(
	'Edit 5 successfully revived:',
	history.same(edits[5], history.reviveEdit(5))
);

// const newYaml = yaml.stringify({
// 	...edits[edits.length - 1],
// 	history: history.editHistory,
// });
//
// fs.writeFileSync('./demo-yaml.yaml', newYaml);
