const chalk = require("chalk");
const Discord = require("discord.js");
const fs = require("fs");

const axios = require('axios');

let { delay, sendToWebhook, webhookURL } = require("./config.json");

let attempts = 0;
let workingCodeCount = 0;

// Generate a random 11 character string
function generateCode() {
	let char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890_-";
	let result = "";
	for (let i = 0; i < 11; i++) {
		result += char.charAt(Math.floor(Math.random() * char.length));
	}
	return result;
}

// Check if the code is valid
async function validateCode() {
	let code = generateCode();

	// update the attempts counter
	attempts++;
	process.title = `Realm Code Generator - By MrDiamond64 | Total Attempts: ${attempts} | Working Codes: ${workingCodeCount} | Checking Code: ${code}`;

	// make sure we havent already recorded the code in our database
	const invalidcodes = JSON.parse(
		fs.readFileSync("./codes/invalidcodes.json"),
	);

	if (invalidcodes[code]) return console.log(chalk.gray(`https://open.minecraft.net/pocket/realms/invite/${code} is in our invalid realm codes database, skipping`));

	await axios.get(`https://open.minecraft.net/pocket/realms/invite/${code}`, { headers: {
		"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
		"accept-encoding": "gzip, deflate, br",
		"accept-language": "en-US",
		"cache-control": "max-age=0",
		"connection": "keep-alive",
		"dnt": "1",
		"host": "open.minecraft.net",
		"sec-fetch-dest": "document",
		"sec-fetch-mode": "navigate",
		"sec-fetch-site": "none",
		"sec-fetch-user": "?1",
		"TE": "trailers",
		"upgrade-insecure-requests": "1",
		"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:95.0) Gecko/20100101 Firefox/95.0"
	}})
    .then((res) => {
		console.log(1)
        if(typeof(res) == "object") {
            if(res.status == 200) workingCode(code)
                else console.log(res.status)
            }
    })
    .catch(function(error) {
		if(!error.response) return;
        if(error.response.status == 404) {
			console.log(chalk.red(`https://open.minecraft.net/pocket/realms/invite/${code} is an invalid realm code.`));

        	// add the invalid code to our database
        	invalidcodes[code] = {
            	isInvalid: true
        	}
        	fs.writeFileSync('./codes/invalidcodes.json', JSON.stringify(invalidcodes));
		} else {
			if(error.response.status == 403) {
				delay++
				console.log(`You are being ratelimited! Delay has been increased to ${delay}`)
			} else console.log(`Error. Status code: ${error.response.status}`)
		}
	})
}

// This function runs if the code is valid
function workingCode(code) {
	console.log(chalk.greenBright(`Found working code: ${code}. URL: https://open.minecraft.net/pocket/realms/invite/${code}`))
	workingCodeCount++

	// save the code to the working codes data  base
	const workingcodes = JSON.parse(
		fs.readFileSync("./codes/workingcodes.json"),
	);

	workingcodes[code] = {
		working: true
	}
	fs.writeFileSync('./codes/workingcodes.json', JSON.stringify(workingcodes));

	// send to webhook stuff
	if(!sendToWebhook) return;

	let webhookClient = new Discord.WebhookClient({ url: webhookURL });

	const embed = new Discord.MessageEmbed()
		.setColor('GREEN')
		.setTitle('Found working code')
		.setAuthor('Realm Code Generator')
		.setDescription(`https://open.minecraft.net/pocket/realms/invite/${code} is a valid realm code`)
		.setThumbnail('https://i.imgur.com/OY1Hz6m.jpg')
		.setTimestamp()
		.setFooter(`https://github.com/MrDiamond64/realm-code-gen`);

	webhookClient.send({
		username: 'Realm Code Generator',
		embeds: [embed],
	});
}

validateCode();
setInterval(() => {
	validateCode();
}, delay);