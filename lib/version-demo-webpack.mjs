import { displayHistory, initJsonEditor, setHistoryIndex, loadFullHistory } from './version-editor.mjs';
import { $ } from './util.mjs';
import { fromBase64 } from './base64.mjs';

const sampleHistory = [
	"i.q64FAA==",
	"p.i4420DGM1Yk21FGKUcpIzcnJj1GyigGylYCCIKlYAA==",
	"p.i4420DE0iNWJNtRRKs8vyklRArINdIxiYwE=",
	"p.i4420DE0i9WJNtRR0olRyivNTUotKo5RsoqOVQKKAiVjYwE=",
	"p.i4420DGyiNWJNtRRMtQxUgKygAKxsQA=",
	"p.i4420DE2jNWJNtRR0jFWAjIMdIxiYwE=",
	"p.i4420DE2jtWJNtRR0jHRMdUxUwJyDHSMYmMB",
	"p.i4420DExiNWJNtRR0olRKkmtKIlRsopRilFSAgoa6BjGxgIA",
	"p.i4420DGxjNWJNtRRCslIVQKyDHSMYmMB",
	"p.i4420DE1itWJNtRRUigszUzOVkgqyi/PU0jLr1ACChvoGMXGAgA=",
	"p.i4420DGziNWJNtRRUsgqzS0oVsgvSy1SAooY6BjFxgIA",
	"p.i4420DG3jNWJNtRRUijJSFUCMg10jGJjAQ==",
	"p.i4420LEwjtWJNtRRykmsqlRIUQJyDHSMYmMB",
	"p.i4420LEwjtWJNtRRUlAC0kBubCwA",
	"p.i4420LE0iNWJNtRRyk9XAjIMdIxiYwE=",
	"p.i4420LE0itWJNtRR0lMC0gY6RrGxAA==",
	"p.i4420DE2jtWJ1jXUMQNSBjqmZrGxAA==",
	"p.i4420DG0iNWJNtRRKijKzE1VArINdMwNY2MB",
	"p.i4420DEyjtWJNtRRilcC0gY65oaxsQA=",
	"p.i4420DE2i9WJ1jXUMQJSBjqm5rGxAA==",
	"p.i4420DE2j9WJNtRR0jFVAjIMdEzNYmMB",
	"i.DcpJCoRADADAr4Scw8AgIvgObyLiEtduo7HbFf+u56obOzZGMMZd1NRIOGtvOZ+8LVlXjNM/BRRSlBE6PtwXk45h8X01QqmyT9DIAYO38wqysYL72BTXCbW0P3xe",
	"p.i4420DExjNWJNtRR0jE01DE0VgJyDHRMzWJjAQ==",
	"p.i4420DE0MIrViTbUUdKJUSoszS9JLY5RsoqOVQIKAiVjYwE=",
	"p.i4420DE0NI7ViTbUUYpR8kssyM9Jzc+LUVICChnoGMXGAgA=",
	"p.i4420DE0NIrVidY11DEEUoY6StVKQBoobIAiahWjFKNUC5WKjQUA",
	"p.i4420DE0Mo3ViTbUUXJMyklVKE8sVvDUUQKKGOgYx8YCAA==",
	"p.i4420DE0NovViTbUUVJILUpV8FQoTixXSM1JSlQCihroGMfGAgA=",
	"p.i4420DE2i9WJNtRRMtJRAjIMdAwNLWJjAQ==",
	"p.i4420DE0No/VidY11DEEUgY6JkDSUEdJRwnMMzSJjQUA",
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