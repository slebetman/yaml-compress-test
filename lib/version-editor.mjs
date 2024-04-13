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
	let debounceTimer;

	const debounce = (fn) => {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(fn,500);
	}

	window.addEventListener('load', () => {
		const editor = $('json-editor');
		const commitBtn = $('#commitBtn');
		const restoreBtn = $('#restoreBtn');

		editor.addEventListener('keyup', (e) => {
			if (editor.is_valid()) {
				const val = editor.value;
				if (val != lastValue) {
					debounce(() => {
						history.add(editor.json_value);
						lastValue = editor.value;
						displayHistory();
					});
				}
			}
		})

		commitBtn.onclick = (e) => {
			history.undo((value) => {
				editor.json_value = value;
				lastValue = editor.value;
				displayHistory();
			})
		}

		restoreBtn.onclick = (e) => {
			history.redo((value) => {
				editor.json_value = value;
				lastValue = editor.value;
				displayHistory();
			})
		}
	})
}