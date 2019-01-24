const Web3 = require('web3');
const Web3WsProvider = require('web3-providers-ws');
const validator = require('./validate').validator;
const TOKEN_ABI = require('./abi');
const conf = require('../config');


function filterBaseAccount(item) {
    return item.toLowerCase() !== BaseAccount.toLowerCase();
}

function  TraceInternalContractTransactions() {
    try{
        const WSprovider = new Web3WsProvider(conf.WS_URL);
        const web3 = new Web3(WSprovider);
        const web3Http = new Web3(new Web3.providers.HttpProvider(conf.RPC_URL));

        web3Http.providers.HttpProvider.prototype.sendAsync = web3Http.providers.HttpProvider.prototype.send;
        setInterval(() => {
            validator.getDepositAccounts().then(accounts => {
                if (accounts !== undefined){
                    web3Http.currentProvider.sendAsync({
                        method: "trace_block",
                        params: ['latest'],
                        jsonrpc: "2.0",
                        id: "2"
                    }, (err, result) => {
                        if (result != null) {
                            if (result.result.length > 0) {
                                result.result.forEach((item) => {
                                    let action = item.action;
                                    let txHash = item.transactionHash;
                                    if (action != null && action.to != null) {
                                        var toAddress = action.to;
                                        if (accounts.indexOf(toAddress) != -1) {
                                            var amount = action.value;
                                            if (amount != null) {
                                                console.log('Found incoming Ether transaction from ' + action.from + ' to ' + action.to);
                                                console.log('Transaction value is: ' + web3.utils.fromWei(amount));
                                                console.log('Transaction hash is: ' + txHash + '\n');
                                            }
                                        }
                                    }
                                });

                            }
                        }

                    });
                    }

        });

        },2000);


    }catch (err) {
      var e = err;
    }
}



function watchEtherTransfers() {
    try {
        // Instantiate web3 with WebSocket provider
        // Instantiate web3 with HttpProvider
        const WSprovider = new Web3WsProvider(conf.WS_URL);
        const web3 = new Web3(WSprovider);
        const web3Http = new Web3(new Web3.providers.HttpProvider(conf.RPC_URL));



        let prevTxHash = "";
// Instantiate subscription object

        const subscription = web3.eth.subscribe('pendingTransactions',async function(error, txHash){
            if (!error) {
                try {
                    if (txHash.length > 0){

                        // Get transaction details
                        const trx = await web3Http.eth.getTransaction(txHash);
                        if (trx != null && trx !== undefined){
                            const valid = await validator.validateTransaction(trx);
                            // If transaction is not valid, simply return
                            if (!valid) return;


                            if (prevTxHash !== txHash){
                                console.log('Found incoming Ether transaction from ' + trx.from + ' to ' + trx.to);
                                console.log('Transaction value is: ' + web3.utils.fromWei(trx.value));
                                console.log('Transaction hash is: ' + txHash + '\n');                               
                                prevTxHash = txHash;
                            }
                        }
                    }
                }
                catch (error) {
                    console.log(error);
                }
            } else
                console.error(error);
        })
            .on('data', async (txHash) => {
              console.log(txHash);
            })
            .on("error", console.error);
        subscription.unsubscribe();

    } catch (error) {
        console.log(error);
    }

}

function watchTokenTransfers() {
  // Instantiate web3 with WebSocketProvider

    try {
        const web3 = new Web3(new Web3WsProvider(conf.WS_URL));

        validator.getDepositAccounts().then(accounts => {
            if (accounts !== undefined){
                // Generate filter options
                const options = {
                    filter: {
                        _to:  accounts
                    },
                    fromBlock: 'latest'
                };

                let prevTxHash = "";
                for (let i=0; i< conf.TOKEN_CONTRACT_ADDRESSES.length; i++) {
                    let tokenObj = conf.TOKEN_CONTRACT_ADDRESSES[i];
                    const tokenContract = new web3.eth.Contract(
                        TOKEN_ABI, tokenObj.addr,
                        (error, result) => { if (error) console.log(error) }
                    );
                    tokenContract.events.Transfer(options, async (error, event) => {
                        if (error) {
                            console.log(error);
                            return;
                        }
                        if (event!= null && prevTxHash !== event.transactionHash){
                            console.log('Token Transaction hash is: ' + event.transactionHash + '\n');
                            prevTxHash = event.transactionHash;
                        }
                    });
                }
            }

        });
    }catch (error) {
        console.log(error);
    }
}

function watchLatestBlocks() {
    try {
        const web3 = new Web3(new Web3WsProvider(conf.WS_URL));


        let previousBlockHash = "";
        const intervalObj = setTimeout(() => {
            const subscription = web3.eth.subscribe('newBlockHeaders', function(error, result){
                if (!error) {
                    console.log('got block:' + result.number + '\n');
                    if (previousBlockHash !== result.hash) {
                        previousBlockHash = result.hash;
                    }
                } else
                console.error(error);
            })
                .on("error", console.error);
            subscription.unsubscribe();
        }, conf.BLOCK_DELAY_SEC * 1000);

    }catch (error) {
        console.log(error);
    }
}

module.exports = {
  watchEtherTransfers,
  watchTokenTransfers,
  TraceInternalContractTransactions,
  watchLatestBlocks
};
