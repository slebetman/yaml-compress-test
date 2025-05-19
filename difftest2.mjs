import history from "./lib/difftest.mjs";

console.time('Execution time');

console.log('History array:', history.length);

const obj = history.reviveEdit(2);
history.addDframe(obj);

console.log('History array:', history.length);

console.timeEnd('Execution time');