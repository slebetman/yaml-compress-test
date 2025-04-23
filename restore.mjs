import yaml from 'yaml';
import UndoRedo from './lib/version-manager.mjs';
import { fromBase64 } from './lib/base64.mjs';


// Copy edit history here:
const editHistory = [
	"",
].map(x => {
	let ret = x.split('.');
	ret[1] = fromBase64(ret[1]);
	return ret;
});

const history = new UndoRedo();

history.loadFullHistory(editHistory);

// Restore the version you want here:
const document = history.checkout(0);

console.log(yaml.stringify(document));
