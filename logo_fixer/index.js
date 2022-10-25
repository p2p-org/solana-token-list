const download = require('download');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');
const { promisify } = require('util');
const Promise = require("bluebird");

// fs promises
function existsAsync(path) {
  return new Promise(function(resolve, reject){
    fs.exists(path, function(exists){
      resolve(exists);
    })
  })
}

function ensureDirectoryExistence(filePath) {
  var dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

// fix logo of a token
async function fixLogo(token) {
	const newEndpoint = "https://raw.githubusercontent.com/p2p-org/token-list";
	const deprecatedEndpoint = "https://raw.githubusercontent.com/bigearsenal/solana-token-list";

	// copy token
	let updatedToken = token;

	// if logo is not svg return
	if (path.extname(token.logoURI.toLowerCase()) !== ".svg") {
		updatedToken.logoURI = updatedToken.logoURI.replace(deprecatedEndpoint, newEndpoint);
		return updatedToken;
	}
	
	console.log("===== Processing logo with url " + token.logoURI);

	// download svg
	const downloadFolder = `${__dirname}/../assets/mainnet` + "/" + token.address;
	const downloadedSVGFile = downloadFolder + "/logo.svg";

	// download if not exists
	const isFileExists = await existsAsync(downloadedSVGFile);
	if (!isFileExists || !token.logoURI.startsWith(deprecatedEndpoint)) {
		console.log("SVG file not exists, downloading...");
		ensureDirectoryExistence(downloadedSVGFile);
		fs.writeFileSync(downloadedSVGFile, await download(token.logoURI));
	}

	// convert to png
	const convertedPNGFile = downloadFolder + "/logo.png";

	let info = await sharp(downloadedSVGFile).png().toFile(convertedPNGFile);
	console.log("Successfully converted svg file to png!");

	// remove svg
	// console.log("Removing svg...");
	// fs.unlink(downloadedSVGFile, (error) => {
	// 	// if any error
	// 	if (error) {
	// 		console.error("Error removing svg: " + downloadedSVGFile);
	// 		console.error(error);
	// 		return;
	// 	}
	// });

	// return updated token
	let updatedURI = newEndpoint + "/main/assets/mainnet/31GpPxe1SW8pn7GXimM73paD8PZyCsmVSGTLkwUAJvZ8/logo.png"
	token.logoURI = updatedURI;
	return updatedToken
}

// executing function
(async () => {
	let sampleDir = '../src/tokens/solana.tokenlist.json';
	let sample = require(sampleDir);
    let tokens = sample.tokens;
    for (var i = 0; i < tokens.length; i++) {
    	console.log("===== Processing " + (i + 1) + " of " + tokens.length);
    	try {
    		let updatedJSON = await fixLogo(tokens[i]);
    		if (updatedJSON && updatedJSON !== tokens[i]) {
    			tokens[i] = updatedJSON;
    			sample.tokens = tokens;
			    const writeFileAsync = promisify(fs.writeFile);
			    await writeFileAsync(`${__dirname}/${sampleDir}`, JSON.stringify(sample, null, 2));
    		}
    	} catch(error) {
    		console.error(error);
    	}
    }    
})().catch(e => {
    // Deal with the fact the chain failed
    console.log(e);
});