import { deflateSync, inflateSync, strFromU8, strToU8 } from 'fflate';
import { toBase64 } from './lib/base64.mjs';
import createPatch from 'textdiff-create';
import applyPatch from 'textdiff-patch';
import { fromBase64 } from './base64.mjs';

const IFRAME_INTERVAL = 50;

export const editHistory = [];

const editHistoryEnd = () => {
	return editHistory.length-1
};

const formatHistory = (type, edit) => {
	return `${type}.${edit}`;
}

const unformatHistory = (history) => {
	const x = history.split('.');
	return {
		type: x[0],
		edit: x[1],
	}
}

const encodeFrame = (str) => {
	return toBase64(
		deflateSync(
			strToU8(str)
		)
	)
}

const decodeFrame = (edit) => {
	strFromU8(inflateSync(fromBase64(edit)));
}

const getIframeFromIdx = (idx) => {
	for (let i=idx; i>=0; i++) {
		let edit = editHistory[i];
		if (edit.match(/^i/)) {
			return {
				edit: unformatHistory(edit).edit,
				index: i,
			}
		}
	}
	return null;
}

const getLastIframe = () => {
	return getIframeFromIdx(editHistoryEnd());
}

export const reviveLastEdit = () => {
	return reviveEdit(editHistoryEnd());
}

const reviveEdit = (idx) => {
	const lastIframe = getIframeFromIdx(idx);

	if (!lastIframe) {
		throw new Error('Invalid history: no iframe found');
	}

	if (lastIframe.index === (editHistoryEnd())) {
		return decodeFrame(lastIframe.edit);
	}
	else {
		const lastEdit = unformatHistory(editHistory[editHistoryEnd()]);

		return applyPatch(
			decodeFrame(lastIframe.edit),
			decodeFrame(JSON.parse(lastEdit.edit))
		)
	}
}

export const addIframe = (obj) => {
	const iFrame = encodeFrame(JSON.stringify(obj));
	editHistory.push(formatHistory('i',iFrame));
}

export const addPframe = (obj) => {
	const lastIframe = getLastIframe();

	if (!lastIframe) {
		throw new Error('Unable to add pframe: no iframe found');
	}

	const lastEdit = lastIframe.edit;
	const edit = JSON.stringify(obj);

	const diff = createPatch(lastEdit, edit);
	const pFrame = encodeFrame(JSON.stringify(diff));
	editHistory.push(formatHistory('p',pFrame));
}

export const addHistory = (obj) => {

}