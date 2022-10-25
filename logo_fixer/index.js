const download = require('download');
const sample = require('../src/tokens/sample.json');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

// fix logo of a token
async function fixLogo(token) {
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
	console.log("Successfully converted svg file to png!");

	// remove svg
	console.log("Removing svg...");
	fs.unlink(downloadedSVGFile, (error) => {
		// if any error
		if (error) {
			console.error("Error removing svg: " + downloadedSVGFile);
			console.error(error);
			return;
		}
	});

	// return updated token
	return updatedToken
}

// executing function
(async () => {
    let tokens = sample.tokens;
    for (var i = 0; i < tokens.length; i++) {
		console.log("===== Processing logo with url " + tokens[i].logoURI);
    	try {
    		let updatedJSON = await fixLogo(tokens[i]);

    		if (updatedJSON) {
    			// console.log(updatedJSON);
    		}

    	} catch(error) {
    		console.error(error);
    	}
    }
})().catch(e => {
    // Deal with the fact the chain failed
    console.log(e);
});