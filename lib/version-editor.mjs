import { $ } from './util.mjs';
import UndoRedo from './version-manager.mjs';

const history = new UndoRedo()

let lastValue = '';

export const displayHistory = () => {
	const historySize = history.editHistory.reduce((a,v) => {
		return a + 1 + v[1].length;	
	},0);
	$('#history-log').innerText = `size: ${historySize} bytes\n\n` +
		history.dumpEditHistory().join('\n');
}

export const loadFullHistory = (edits) => {
	history.loadFullHistory(edits);
}

export const initJsonEditor = () => {
	window.addEventListener('load', () => {
		const editor = $('json-editor');
		const commitBtn = $('#commitBtn');
		const restoreBtn = $('#restoreBtn');

		editor.addEventListener('keyup', (e) => {
			if (editor.is_valid()) {
				const val = editor.value;
				if (val != lastValue) {
					commitBtn.disabled = false;
				}
			}
		})

		commitBtn.onclick = (e) => {
			if (editor.is_valid()) {
				const val = editor.value;
				if (val != lastValue) {
					history.add(editor.json_value);
					lastValue = editor.value;
					commitBtn.disabled = true;
					displayHistory();
				}
			}
		}

		restoreBtn.onclick = (e) => {
			const idx = Number(window.prompt('Version number?'));
			const value = history.checkout(idx);
			editor.json_value = value;
			lastValue = editor.value;
			commitBtn.disabled = true;
			displayHistory();
			displayHistory();
		}
	})
}