import history from "./lib/difftest.mjs";
import humanize from "humanize";

console.log('History array:', history.length);

const obj = history.reviveEdit(2);

console.time('Execution time');

history.addDframe(obj);

console.log('History array:', history.length);
console.log('Diff size:',
	humanize.filesize(
		history.editHistory[history.editHistoryEnd()][1].length
	)
);

console.timeEnd('Execution time');