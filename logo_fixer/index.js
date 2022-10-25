const download = require('download');
const sample = require('../src/tokens/sample.json');
const path = require('path');
const sharp = require('sharp');

// fix logo of a token
async function fixLogo(token) {

	// alert
	console.log("===== Processing logo with url " + token.logoURI);

	// if logo is not svg return
	if (path.extname(token.logoURI.toLowerCase()) !== ".svg") {
		console.log("Logo is not svg, skiped");
		return;
	} 

	// copy token
	let updatedToken = token;

	// download svg
	const downloadFolder = `${__dirname}/../assets` + "/" + token.address;
	await download(token.logoURI, downloadFolder);

	// convert to png
	const downloadedSVGFile = downloadFolder + "/logo.svg";
	const convertedPNGFile = downloadFolder + "/logo.png";

	let info = await sharp(downloadedSVGFile).png().toFile(convertedPNGFile);
	console.log(info);

	// remove svg

	// return updated token
	return updatedToken
}

// executing function
(async () => {
    let tokens = sample.tokens;
    for (var i = 0; i < tokens.length; i++) {
    	let updatedJSON = await fixLogo(tokens[i]);
    	if (updatedJSON) {
    		// console.log(updatedJSON);
    	}
    }
})().catch(e => {
    // Deal with the fact the chain failed
    console.log(e);
});