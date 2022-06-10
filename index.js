// this scripts get the price of currencies from chainlink
// logs it to the console
import Web3 from 'https://deno.land/x/web3/mod.ts'
import { link } from "./link.js";
import {coins} from "./coinList.js";
// connect to the evm chain
let url =''
const web3 = new Web3(new Web3.providers.HttpProvider(url));

const getPrices = async () => {
    console.log('Getting prices...')
    let coinsPrices = await Promise.all(coins.map(async (coin)=>{
        let contract = new web3.eth.Contract(link, coin.contract)
        let price = ((await contract.methods.latestAnswer().call())/10**(await contract.methods.decimals().call())).toFixed(3)
        return { ...coin, price } 
    }))
    return coinsPrices
}


const saveFile = async (coinsPrices) => {
    console.log('Saving file...')
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(coinsPrices));
    let block = await web3.eth.getBlockNumber()
    await Deno.writeFile(`./data/coinsPrices${block}.json`, data);
}
await saveFile(await getPrices())