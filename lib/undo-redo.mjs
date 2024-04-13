import HistoryCore from "./history-core.mjs";

export default class UndoRedo {
	#history;
	#currentIndex;

	constructor (options) {
		this.#history = new HistoryCore({
			patchAlgorithm: options?.patchAlgorithm,
			iframeInterval: options?.iframeInterval,
		});
		this.#currentIndex = 0;
	}

	get editHistory () {
		return this.#history.editHistory;
	}

	get currentIndex () {
		return this.#currentIndex;
	}
	
	add (obj) {
		if (this.#currentIndex < this.#history.editHistoryEnd()) {
			this.#history.editHistory.splice(
				this.#currentIndex+1,
				this.#history.editHistory.length
			);
		}

		this.#history.add(obj);
		this.#currentIndex = this.#history.editHistoryEnd();
	}

	loadFullHistory (edits) {
		this.#history.editHistory.splice(0,this.#history.editHistory.length);
		[].push.apply(this.#history.editHistory,edits);
		this.#currentIndex = this.#history.editHistoryEnd();
	}

	undo (callback) {
		if (this.#currentIndex > 0) {
			this.#currentIndex--;
			if (callback) {
				callback(this.#history.reviveEdit(this.#currentIndex));
			}
		}
	}

	redo (callback) {
		if (this.#currentIndex < this.#history.editHistoryEnd()) {
			this.#currentIndex++;
			if (callback) {
				callback(this.#history.reviveEdit(this.#currentIndex));
			}
		}
	}

	dumpEditHistory () {
		return this.#history.dumpEditHistory().map((x,idx) => {
			if (idx === this.#currentIndex) {
				return `-> ${x}`;
			}
			return `   ${x}`;
		});
	}
}