const download = require('download');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');
const { promisify } = require('util');
const Promise = require("bluebird");

// fix logo of a token
async function mergeJupiterTokens(jupiterTokens, currentTokens) {
}

// executing function
(async () => {
	// download tokens from jupiter
	const downloadedJupiterTokenJson = `${__dirname}` + "/jupiter-token.json";
	fs.writeFileSync(downloadedJupiterTokenJson, await download("https://cache.jup.ag/tokens"));

	// merge jupiter tokens with tokens list
	let jupiterTokens = require(downloadedJupiterTokenJson);
	let myTokens = require('../src/tokens/solana.tokenlist.json').tokens;
	let newTokens = [];

	// loops throw jupiterTokens and remove tokens that already exists in myTokens
	for (var i = 0; i < jupiterTokens.length; i++) {
		// log progress
		console.log("===== Processing " + (i + 1) + " of " + jupiterTokens.length);

		// find jupiterTokens in my tokens
		let token = myTokens.find(el => el.address == jupiterTokens[i].address);

		// if token found, ignore it
		if (token) {}
		else {
			let token = jupiterTokens[i]
			console.log("===== Found new token " + token.symbol + " " + token.name + " " + token.address);
			newTokens.push(token);
		}
	}

	// print newTokens
	console.log(newTokens.length)
	fs.writeFileSync(`${__dirname}` + "/new-tokens.json", JSON.stringify(newTokens, null, 4));
  
})().catch(e => {
    // Deal with the fact the chain failed
    console.log(e);
});