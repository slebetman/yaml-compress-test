import { deflateSync, inflateSync, strFromU8, strToU8 } from 'fflate';
import createPatch from 'textdiff-create';
// import * as jsondiffpatch from 'jsondiffpatch';
import applyPatch from 'textdiff-patch';
import { fromBase64, toBase64 } from './base64.mjs';
import DiffMatchPatch from 'diff-match-patch';

const dmp = new DiffMatchPatch();

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

const diff2Obj = (a, b) => {
	const patch = dmp.patch_make(JSON.stringify(a), JSON.stringify(b));
	return dmp.patch_toText(patch);
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

const undiff2Obj = (a, patchString) => {
	const patch = dmp.patch_fromText(patchString);
	return dmp.patch_apply(patch, JSON.stringify(a));
}

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
		let edit = JSON.parse(decodeFrame(lastIframe.edit));
		for (let i = lastIframe.index + 1; i <= idx; i++) {
			let current = unformatHistory(editHistory[i]);

			if (current.type === 'p') {
				edit = undiffObj(
					edit,
					JSON.parse(
						decodeFrame(current.edit)
					)
				);
			}
			else if (current.type === 'd') {
				edit = undiff2Obj(
					edit,
					JSON.parse(
						decodeFrame(current.edit)
					)
				);
			}
		}
		return edit;
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


	const pFrame2 = encodeFrame(
		JSON.stringify(diffObj(reviveLastEdit(), obj))
	);
	editHistory.push(formatHistory('p', pFrame2));
};

export const addDframe = (obj) => {
	const lastIframe = getLastIframe();

	if (!lastIframe) {
		throw new Error('Unable to add dframe: no iframe found');
	}

	const dFrame = encodeFrame(
		JSON.stringify(diff2Obj(reviveLastEdit(), obj))
	);
	editHistory.push(formatHistory('d', dFrame));
}

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
