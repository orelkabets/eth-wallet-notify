const conf = require('../config');
const watcher = require('./watcher');


watcher.watchEtherTransfers();
console.log('Started watching Ether transfers');

if (conf.TOKEN_CONTRACT_ADDRESSES.length > 0) {
    watcher.watchTokenTransfers();
    console.log('Started watching Token transfers\n');
}

console.log('Started watching internal transactions');
watcher.TraceInternalContractTransactions();

watcher.watchLatestBlocks();
console.log('watching latest blocks for confirmations count\n');
