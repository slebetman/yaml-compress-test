import { displayHistory, initJsonEditor, setHistoryIndex, loadFullHistory } from './version-editor.mjs';
import { $ } from './util.mjs';
import { fromBase64 } from './base64.mjs';

const sampleHistory = [
	"i.q64FAA==",
	"p.i4420DGM1Yk21FGKUcpIzcnJj1GyilEqzy/KSYlRUgLKgORjAQ==",
	"p.i4420DE0i9WJNtRR0olRyivNTUotKo5RsgIKGOkY65jomOqYxSoBFQDVxcYCAA==",
	"p.i4420DExiNWJNtRR0olRKkmtKIlRsopRCslIVSgszUzOVkgqyi/PU0jLr1DIKs0tKFbIL0stUigBSuckVlUqpOSn68UoKQENMNAxjI0FAA==",
	"p.i4420DG0iNWJNtRRKijKzE2NVwJygGJGQErXUAdEGYBJIMcQos4UqgRF0FzH0BCbuKExRNTULDYWAA==",
	"p.i4420DE2i9WJNtRRMtJRAjIMdMzMY2MB",
	"p.i4420DE0MInViTbUUdKJUSoszS9JLY5RsqqOUfJLLMjPSc3PA/JilByTclIVyhOLFTwVUotSdYBUcWK5QmpOUmKMUq0SUD/QnNhYAA==",
].map(x => {
	let ret = x.split('.');
	ret[1] = fromBase64(ret[1]);
	return ret;
});

const sampleValue = {
	"hello":"world",
	"prime_numbers":[
		1,
		2,
		3,
		5,
		7,
		11,
		13
	],
	"text":"The quick brown fox jumps over the lazy dog.",
	"quotes":{
		"Napoleon":"Able was I ere, I saw elba"
	}
}

window.ObjHistory = history;
initJsonEditor();

window.addEventListener('load', () => {
	$('#loadSample').onclick = () => {
		$('json-editor').value = JSON.stringify(sampleValue);
		loadFullHistory(sampleHistory);
		displayHistory();
	}
})