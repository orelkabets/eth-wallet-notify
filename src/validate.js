const Web3 = require('web3');
const Web3WsProvider = require('web3-providers-ws');
const conf = require('../config');


const BaseAccount = conf.HOT_WALLET.toLowerCase();
const web3Provider = new Web3WsProvider(conf.WS_URL);




function filterBaseAccount(item) {
    return item.toLowerCase() !== BaseAccount.toLowerCase();
}

async function getDepositAccounts() {
    const web3 = new Web3(web3Provider);
    let depositAccounts =  await web3.eth.getAccounts();
    let sorted = [];
    if (depositAccounts == null || depositAccounts === undefined || depositAccounts.length === 0)
        return sorted;
    for (let i = 0; i < depositAccounts.length; i++) {
        sorted.push(depositAccounts[i].toLowerCase());
    }
    return  sorted.filter(filterBaseAccount);
}

async function validateTransaction(trx) {
    try {
        const toValid = trx.to !== null;
        if (!toValid) return false;
        return await getDepositAccounts().then(result => result.includes(trx.to.toLowerCase()));
    } catch (error) {
        return false;
    }
}

validator = {
    getDepositAccounts,
    validateTransaction
};

module.exports = {validator} ;