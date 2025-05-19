import fs from 'fs';
import { fromBase64 } from './base64.mjs';
import HistoryCore from './history-core.mjs';

const data = JSON.parse(fs.readFileSync('./hong-test.json'));

const edits = data.history.map(x => {
	const [type,edit] = x.edit.split('.');
	return [type, fromBase64(edit)];
});

const history = new HistoryCore({});

edits.forEach(e => {
	history.editHistory.push(e);
});

export default history;
