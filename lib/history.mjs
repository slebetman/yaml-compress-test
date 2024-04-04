import { deflateSync, inflateSync, strFromU8, strToU8 } from 'fflate';
import createPatch from 'textdiff-create';
// import * as jsondiffpatch from 'jsondiffpatch';
import applyPatch from 'textdiff-patch';
import { fromBase64, toBase64 } from './base64.mjs';

const IFRAME_INTERVAL = 20;

const DIFF_ALGORITHM = 'textdiff'; // textdiff or jsondiffpatch
const PATCH_ALGORITHM = 'progressive'; // direct or progressive

export const editHistory = [];

// export const same = (a, b) => {
// 	return jsondiffpatch.diff(a, b) === undefined;
// };

const diffObj = (a, b) => {
	switch (DIFF_ALGORITHM) {
		case 'textdiff':
			return createPatch(JSON.stringify(a), JSON.stringify(b));
		// case 'jsondiffpatch':
		// 	return jsondiffpatch.diff(a, b);
		default:
			throw new Error('Unsupported algorithm');
	}
};

const undiffObj = (a, patch) => {
	switch (DIFF_ALGORITHM) {
		case 'textdiff':
			return JSON.parse(applyPatch(JSON.stringify(a), patch));
		// case 'jsondiffpatch':
		// 	return jsondiffpatch.patch(a, patch);
		default:
			throw new Error('Unsupported algorithm');
	}
};

export const editHistoryEnd = () => {
	return editHistory.length - 1;
};

const formatHistory = (type, edit) => {
	return `${type}.${edit}`;
};

const unformatHistory = (history) => {
	const x = history.split('.');
	return {
		type: x[0],
		edit: x[1],
	};
};

const encodeFrame = (str) => {
	return toBase64(deflateSync(strToU8(str)));
};

const decodeFrame = (edit) => {
	return strFromU8(inflateSync(fromBase64(edit)));
};

const getIframeFromIdx = (idx) => {
	for (let i = idx; i >= 0; i--) {
		let edit = editHistory[i];
		if (edit.match(/^i/)) {
			return {
				edit: unformatHistory(edit).edit,
				index: i,
			};
		}
	}
	return null;
};

const getLastIframe = () => {
	return getIframeFromIdx(editHistoryEnd());
};

export const reviveLastEdit = () => {
	return reviveEdit(editHistoryEnd());
};

export const reviveEdit = (idx) => {
	const lastIframe = getIframeFromIdx(idx);

	if (!lastIframe) {
		throw new Error('Invalid history: no iframe found');
	}

	if (lastIframe.index === idx) {
		return JSON.parse(decodeFrame(lastIframe.edit));
	} else {
		switch (PATCH_ALGORITHM) {
			case 'direct':
				const lastEdit = unformatHistory(editHistory[idx]);

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
							decodeFrame(unformatHistory(editHistory[i]).edit)
						)
					);
				}
				return edit;
			default:
				throw new Error('Unsupported patch algorithm');
		}
	}
};

export const addIframe = (obj) => {
	const iFrame = encodeFrame(JSON.stringify(obj));
	editHistory.push(formatHistory('i', iFrame));
};

export const addPframe = (obj) => {
	const lastIframe = getLastIframe();

	if (!lastIframe) {
		throw new Error('Unable to add pframe: no iframe found');
	}

	switch (PATCH_ALGORITHM) {
		case 'direct':
			const pFrame = encodeFrame(
				JSON.stringify(
					diffObj(JSON.parse(decodeFrame(lastIframe.edit)), obj)
				)
			);
			editHistory.push(formatHistory('p', pFrame));
			break;
		case 'progressive':
			const pFrame2 = encodeFrame(
				JSON.stringify(diffObj(reviveLastEdit(), obj))
			);
			editHistory.push(formatHistory('p', pFrame2));
			break;
		default:
			throw new Error('Unsupported patch algorithm');
	}
};

export const addHistory = (obj) => {
	const lastIframe = getLastIframe();

	if (
		lastIframe === null ||
		editHistory.length - lastIframe.index > IFRAME_INTERVAL
	) {
		addIframe(obj);
	} else {
		addPframe(obj);
	}
};
