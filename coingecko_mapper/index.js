const download = require('download');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');
const { promisify } = require('util');
const Promise = require("bluebird");

// executing function
(async () => {
	// get coingecko token infos
	const json = `${__dirname}` + "/coingecko-tokens.json";
	let coingeckoTokenInfos = require(json);

	let list = require('../src/tokens/solana.tokenlist.json');
	let myTokens = list.tokens

	// loops throw myTokens and update/add coingecko id
	for (var i = 13300; i < myTokens.length; i++) {
		// log progress
		console.log("===== Processing " + (i + 1) + " of " + myTokens.length);

		// find coingeckoId in my tokens
		let token = coingeckoTokenInfos.find(el => el.platforms.solana == myTokens[i].address);

		// if token found, update coingeckoId
		if (token) {
			// assert extensions existence
			if (!myTokens[i].extensions) {
				myTokens[i].extensions = {};
			}

			// ignore id if it has already been set
			if (token.id == myTokens[i].extensions.coingeckoId) {
				continue;
			} 

			// update coingeckoId
			myTokens[i].extensions.coingeckoId = token.id
			console.log("========== Found new coingeckoId " + token.id);
		}
	}

	// print newTokens
	console.log(myTokens.length)
	list.tokens = myTokens
	fs.writeFileSync(`${__dirname}` + "/../src/tokens/solana.tokenlist.json", JSON.stringify(list, null, 2));
  
})().catch(e => {
    // Deal with the fact the chain failed
    console.log(e);
});