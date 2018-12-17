var config = {
    NODE_ENV :"development",
    RPC_URL : "https://rinkeby.infura.io/CUNjkZ8qg6WZHqeFNJyL"
    WS_URL: "wss://rinkeby.infura.io/ws",
    TOKEN_CONTRACT_ADDRESSES : [{
        token: "AE",
        contractAddress: "0xeb8e94f5b56f5368b8fafcf6cc97bcb4545a63e7"
    },{
        token: "BIT2COIN",
        contractAddress: "0x89a2516ebC2C42f8123C71cFb33C3A9eBa0bFa93"
    }],
    HOT_WALLET:"<your hot wallet address , or u can get it inside the code using web3.eth.getAccounts().then(e => let firstAcc=e[0]; console.log(firstAcc));> ",
    BLOCK_DELAY_SEC: 10
};


module.exports = config;


