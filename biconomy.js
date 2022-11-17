const Web3 = require("web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const { Biconomy } = require('@biconomy/mexa');
require('dotenv').config({ path: require('find-config')('.env') })
const CollectionAbi = require('./abi.json');

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PROVIDER_URL_MAINNET = "wss" + process.env.PROVIDER_URL_MAINNET.substring(5, process.env.PROVIDER_URL_MAINNET.length);
const BICONOMY_MAINNET = process.env.BICONOMY_MAINNET;
const PROVIDER_URL = process.env.PROVIDER_URL;
const BICONOMY = process.env.BICONOMY;

let ALCHEMY_URL;

let providerUrl;
let biconomyApi;
let globalNFT;
let globalClaim;
let networkId;

let providerUrlTestnet = PROVIDER_URL;
let biconomyApiTestnet = BICONOMY;

providerUrl = PROVIDER_URL_MAINNET;
biconomyApi = BICONOMY_MAINNET;


let networkIdTestnet = '80001';
let ALCHEMY_URLTestnet = "https" + process.env.PROVIDER_URL.substring(3, process.env.PROVIDER_URL.length);


let batchId = 1;
let keys = [PRIVATE_KEY];
const provider = new HDWalletProvider({
	privateKeys: keys,
	providerOrUrl: providerUrl,

});

const testnetProvider = new HDWalletProvider({
    privateKeys: keys,
    providerOrUrl: providerUrlTestnet,
});


const biconomy = new Biconomy(new Web3.providers.WebsocketProvider(providerUrl), 
    {apiKey: biconomyApi, strictMode: true, walletProvider: provider});
const web3 = new Web3(biconomy);
const web3N = new Web3(provider);

//testnet 

const biconomyTestnet = new Biconomy(new Web3.providers.WebsocketProvider(providerUrlTestnet),
    {apiKey: biconomyApiTestnet, strictMode: true, walletProvider: testnetProvider});
const web3Testnet = new Web3(biconomyTestnet);
const web3NTestnet = new Web3(testnetProvider);


async function biconomyInit() {
    return new Promise((res, rej) => {
        try{
            biconomy.onEvent(biconomy.READY, async() => {
                console.log("Biconomy is ready");
                res();
            })
            .onEvent(biconomy.ERROR, (error,message) => {
                console.log(error,message);
                rej();
            }) 
        } catch(error){
            console.log(error);
        }
    })
    
}

async function TestnetBiconomyInit(){
    return new Promise((res, rej) => {
        try{
            biconomyTestnet.onEvent(biconomyTestnet.READY, async() => {
                console.log("Biconomy testnet is ready");
                res();
            })
            .onEvent(biconomyTestnet.ERROR, (error,message) => {
                console.log(error,message);
                rej();
            }) 
        }
        catch(error){
            console.log(error);
        }
    })
   
}

const sendMainnetTransaction = async() => {
    try {
        return new Promise((res, rej) => {
            const mainnetAddress = "0x1aF7768737e41D227Fd0f6330Ed7B0ad846A8B73";

            let mainnetContract = new web3.eth.Contract(
                CollectionAbi,
                mainnetAddress
            );
            console.log('Sending Mainnet transaction.......')
            mainnetContract.methods.mintUnderCollection("0x5E9f2865d4B46a17e15B48946419fCfE8271be5E", "Session_id", "0x2631e5e8717fAeaD0EBa72fEd5694aD1Fa0d3581", 1, 5, `ipfs://metadata`).send({
                    from: process.env.MINTER
            })
            .on('transactionHash', (hash) => console.log('Mainnet txhash', hash))
            .on('receipt', (response) => {res(); console.log('Mainnet transaction success!')})
            .on('error', (err) => { res(); console.log('Testnet ERROR:', err)});
        });
    } catch(e) {
        console.log(e);
        //rej();
    }
    
}

const sendTestnetTransaction = async() => {
    try {

        return new Promise((res, rej) => {
            const testnetAddress = "0x8e86557984CF2C7212c4d44A1d5983d1CA06bdE0"

            let testnetContract = new web3Testnet.eth.Contract(
                CollectionAbi,
                testnetAddress
            );

            console.log('Sending Testnet transaction.......');
            testnetContract.methods.mintUnderCollection("0x58C81dd9F7aB3cF3a6dC36bb2b9B84b76052C51C", "Session_id", "0x2631e5e8717fAeaD0EBa72fEd5694aD1Fa0d3581", 1, 5, `ipfs://metadata`).send({
                from: process.env.MINTER,
            })
            .on('transactionHash', (hash) => console.log('Testnet txhash', hash))
            .on('receipt', (response) => {res(); console.log('Testnet transaction success!')})
            .on('error', (err) => { res(); console.log('Testnet ERROR:', err)});
        })
        

    } catch(e) {
        console.log(e);
        //rej();
    }
}



const initAndSendTransaction = async() => {
    try {
        // await biconomy.init();
        // await biconomyTestnet.init();

        await biconomyInit();
        await TestnetBiconomyInit();

        await sendMainnetTransaction();

        await sendTestnetTransaction();
        
    } catch(e) {
        console.log(e);
    }
}


initAndSendTransaction();





