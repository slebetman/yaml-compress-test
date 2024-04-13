import yaml from 'yaml';
import fs from 'fs';
import UndoRedo from './lib/undo-redo.mjs'

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

const history = new UndoRedo();

for (const e of edits) {
	history.add(e);
}

console.log(
	'History sizes',
	history.editHistory.map((x) => x[0].length + x[1].length)
);

let editFive;

const cb = x => editFive = x

history.undo(cb);
history.undo(cb);
history.undo(cb);
history.undo(cb);
history.undo(cb);
history.undo(cb);
history.redo(cb);
history.undo(cb);

console.log(
	'Edit 5 successfully revived:',
	JSON.stringify(edits[5]) === JSON.stringify(editFive)
);

// const newYaml = yaml.stringify({
// 	...edits[edits.length - 1],
// 	history: history.editHistory,
// });
//
// fs.writeFileSync('./demo-yaml.yaml', newYaml);
