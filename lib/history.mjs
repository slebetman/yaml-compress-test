import { deflateSync, inflateSync, strFromU8, strToU8 } from 'fflate';
import createPatch from 'textdiff-create';
import * as jsondiffpatch from 'jsondiffpatch';
import applyPatch from 'textdiff-patch';
import { fromBase64, toBase64 } from './base64.mjs';

const IFRAME_INTERVAL = 50;

const DIFF_ALGORITHM = 'textdiff'; // textdiff or jsondiffpatch

export const editHistory = [];

export const same = (a, b) => {
	return jsondiffpatch.diff(a, b) === undefined;
};

const diffObj = (a, b) => {
	switch (DIFF_ALGORITHM) {
		case 'textdiff':
			return createPatch(JSON.stringify(a), JSON.stringify(b));
		case 'jsondiffpatch':
			return jsondiffpatch.diff(a, b);
		default:
			throw new Error('Unsupported algorithm');
	}
};

const undiffObj = (a, patch) => {
	switch (DIFF_ALGORITHM) {
		case 'textdiff':
			return JSON.parse(applyPatch(JSON.stringify(a), patch));
		case 'jsondiffpatch':
			return jsondiffpatch.patch(a, patch);
		default:
			throw new Error('Unsupported algorithm');
	}
};

const editHistoryEnd = () => {
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
		const lastEdit = unformatHistory(editHistory[idx]);

		return undiffObj(
			JSON.parse(decodeFrame(lastIframe.edit)),
			JSON.parse(decodeFrame(lastEdit.edit))
		);
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

	const lastEdit = decodeFrame(lastIframe.edit);

	const diff = diffObj(JSON.parse(lastEdit), obj);

	const pFrame = encodeFrame(JSON.stringify(diff));

	editHistory.push(formatHistory('p', pFrame));
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
