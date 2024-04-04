import { $ } from './util.mjs';
import * as history from './history.mjs';

let lastValue = '';
let historyIndex = history.editHistoryEnd();

export const displayHistory = () => {
	const historySize = JSON.stringify(history.editHistory).length;
	$('#history-log').innerText = `size: ${historySize}\n\n` +
		history.editHistory.map((v,i) => {
			if (i === historyIndex) {
				return `-> ${v}`;
			}
			return `   ${v}`;
		}).join('\n');
}

export const setHistoryIndex = (x) => historyIndex = x;

export const initJsonEditor = () => {
	let debounceTimer;

	const debounce = (fn) => {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(fn,500);
	}

	window.addEventListener('load', () => {
		const editor = $('json-editor');
		const undoBtn = $('#undoBtn');
		const redoBtn = $('#redoBtn');

		editor.addEventListener('keyup', (e) => {
			if (editor.is_valid()) {
				const val = editor.value;
				if (val != lastValue) {
					debounce(() => {
						if (historyIndex != history.editHistoryEnd()) {
							history.editHistory.splice(
								historyIndex+1,
								history.editHistory.length
							);
						}

						history.addHistory(editor.json_value);
						historyIndex = history.editHistoryEnd();
						lastValue = editor.value;
						displayHistory();
					});
				}
			}
		})

		undoBtn.onclick = (e) => {
			if (historyIndex > 0) {
				historyIndex--;
				editor.json_value = history.reviveEdit(historyIndex);
				lastValue = editor.value;
				displayHistory();
			}
		}

		redoBtn.onclick = (e) => {
			if (historyIndex < history.editHistoryEnd()) {
				historyIndex++;
				editor.json_value = history.reviveEdit(historyIndex);
				lastValue = editor.value;
				displayHistory();
			}
		}
	})
}