// this scripts get the price of currencies from chainlink
// logs it to the console
import Web3 from "https://deno.land/x/web3/mod.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";
import { link } from "./link.js";
import { coins } from "./coinList.js";

// read env file
let { URL } = await config();
const web3 = new Web3(new Web3.providers.HttpProvider(URL));

const getPrices = async () => {
  console.log("Getting prices...");
  let coinsPrices = await Promise.all(
    coins.map(async (coin) => {
      let contract = new web3.eth.Contract(link, coin.contract);
      let price = (
        (await contract.methods.latestAnswer().call()) /
        10 ** (await contract.methods.decimals().call())
      ).toFixed(3);
      return { ...coin, price };
    })
  );
  return coinsPrices;
};

const saveFile = async (coinsPrices) => {
  let date = new Date();
  let block = await web3.eth.getBlockNumber();
  const decoder = new TextDecoder("utf-8");
  const encoder = new TextEncoder();
  let data = await Deno.readFile("./data.json");
  data = decoder.decode(data);
  data = JSON.parse(data);
  // check if the block is the same as the last block
  let lastItem = data.data[data.data.length - 1];
  if (lastItem?.time.block >= block && lastItem>0) {
    console.log("No new data");
    return;
  } else {
    console.log("New data");
  } // end check
  // add new data to the data file
  data.data.push({
    time:{
        block,
        date
    },
    data: coinsPrices,
  });
  // format data to be saved
  data = encoder.encode(JSON.stringify(data));
  // save data to data.json
  console.log("Saving file...");
  await Deno.writeFile("./data.json", data);
};
await saveFile(await getPrices());
