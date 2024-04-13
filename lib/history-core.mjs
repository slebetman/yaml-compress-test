import { deflateSync, inflateSync, strFromU8, strToU8 } from 'fflate';
import createPatch from 'textdiff-create';
import applyPatch from 'textdiff-patch';
import { toBase64 } from './base64.mjs';

const diffObj = (a, b) => {
	return createPatch(JSON.stringify(a), JSON.stringify(b));
};

const undiffObj = (a, patch) => {
	return JSON.parse(applyPatch(JSON.stringify(a), patch));
};

const formatHistory = (type, edit) => {
	return [type,edit];
};

const unformatHistory = (x) => {
	return {
		type: x[0],
		edit: x[1],
	};
};

const encodeFrame = (str) => {
	return deflateSync(strToU8(str));
};

const decodeFrame = (edit) => {
	return strFromU8(inflateSync(edit));
};

export default class HistoryCore {
	constructor ({
		patchAlgorithm, // progressive or direct
		iframeInterval,
	}) {
		this.IFRAME_INTERVAL = iframeInterval || 20;
		this.PATCH_ALGORITHM = patchAlgorithm || 'progressive'; // direct or progressive
		this.editHistory = [];
	}

	editHistoryEnd () {
		return this.editHistory.length - 1;
	}

	get length () {
		return this.editHistory.length;
	}

	#getIframeFromIdx (idx) {
		for (let i = idx; i >= 0; i--) {
			let edit = this.editHistory[i];
			if (edit[0] === 'i') {
				return {
					edit: unformatHistory(edit).edit,
					index: i,
				};
			}
		}
		return null;
	}
	
	#getLastIframe () {
		return this.#getIframeFromIdx(this.editHistoryEnd());
	}

	reviveLastEdit () {
		return this.reviveEdit(this.editHistoryEnd());
	}
	
	reviveEdit (idx) {
		const lastIframe = this.#getIframeFromIdx(idx);
	
		if (!lastIframe) {
			throw new Error('Invalid history: no iframe found');
		}
	
		if (lastIframe.index === idx) {
			return JSON.parse(decodeFrame(lastIframe.edit));
		} else {
			switch (this.PATCH_ALGORITHM) {
				case 'direct':
					const lastEdit = unformatHistory(this.editHistory[idx]);
	
					return undiffObj(
						JSON.parse(decodeFrame(lastIframe.edit)),
						JSON.parse(decodeFrame(lastEdit.edit))
					);
				case 'progressive':
					let edit = JSON.parse(decodeFrame(lastIframe.edit));
					for (let i = lastIframe.index + 1; i <= idx; i++) {
						edit = undiffObj(
							edit,
							JSON.parse(
								decodeFrame(unformatHistory(this.editHistory[i]).edit)
							)
						);
					}
					return edit;
				default:
					throw new Error('Unsupported patch algorithm');
			}
		}
	}

	setIframe (idx, obj) {
		const iFrame = encodeFrame(JSON.stringify(obj));
		this.editHistory[idx] = formatHistory('i', iFrame);
	}

	#addIframe (obj) {
		const iFrame = encodeFrame(JSON.stringify(obj));
		this.editHistory.push(formatHistory('i', iFrame));
	};
	
	#addPframe (obj) {
		const lastIframe = this.#getLastIframe();
	
		if (!lastIframe) {
			throw new Error('Unable to add pframe: no iframe found');
		}
	
		switch (this.PATCH_ALGORITHM) {
			case 'direct':
				const pFrame = encodeFrame(
					JSON.stringify(
						diffObj(JSON.parse(decodeFrame(lastIframe.edit)), obj)
					)
				);
				this.editHistory.push(formatHistory('p', pFrame));
				break;
			case 'progressive':
				const pFrame2 = encodeFrame(
					JSON.stringify(diffObj(this.reviveLastEdit(), obj))
				);
				this.editHistory.push(formatHistory('p', pFrame2));
				break;
			default:
				throw new Error('Unsupported patch algorithm');
		}
	}
	
	add (obj) {
		const lastIframe = this.#getLastIframe();
	
		if (
			lastIframe === null ||
			this.editHistory.length - lastIframe.index > this.IFRAME_INTERVAL
		) {
			this.#addIframe(obj);
		} else {
			this.#addPframe(obj);
		}
	}

	dumpEditHistory () {
		return this.editHistory.map(x => {
			return `${x[0]}.${toBase64(x[1])}`
		})
	}
}