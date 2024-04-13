import HistoryCore from "./history-core.mjs";

export default class UndoRedo {
	#history;
	#currentIndex;
	maxHistorySize;

	constructor (options) {
		this.#history = new HistoryCore({
			patchAlgorithm: options?.patchAlgorithm,
			iframeInterval: options?.iframeInterval,
		});
		this.maxHistorySize = options?.maxHistorySize || Number.POSITIVE_INFINITY;
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
				this.#history.length
			);
		}

		this.#history.add(obj);

		if (this.#history.length > this.maxHistorySize) {
			const diff = this.#history.length - this.maxHistorySize;
			const bottomFrame = this.#history.reviveEdit(diff);
			this.#history.setIframe(diff, bottomFrame);
			this.#history.editHistory.splice(0,diff);
		}

		this.#currentIndex = this.#history.editHistoryEnd();
	}

	loadFullHistory (edits) {
		this.#history.editHistory.splice(0,this.#history.length);
		[].push.apply(this.#history.editHistory,edits);
		this.#currentIndex = this.#history.editHistoryEnd();
	}

	checkout (idx) {
		const value = this.#history.reviveEdit(idx);
		this.#currentIndex = idx;
		return value;
	}

	dumpEditHistory () {
		return this.#history.dumpEditHistory().map((x,idx) => {
			if (idx === this.#currentIndex) {
				return `-> [${idx}] ${x}`;
			}
			return `   [${idx}] ${x}`;
		});
	}
}