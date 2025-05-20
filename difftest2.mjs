import history from "./lib/difftest.mjs";

console.time('Execution time');

console.log('History array:', history.length);

const obj = history.reviveEdit(2);
history.addDframe(obj);

console.log('History array:', history.length);
console.log('Diff size:',
	history.editHistory[history.editHistoryEnd()][1].length
);

console.timeEnd('Execution time');