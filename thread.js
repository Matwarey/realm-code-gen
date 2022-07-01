const chalk = require("chalk");
const fs = require("fs");
const axios = require('axios');
const { getAttempts, updateAttempts, getCorrectCodes, updateCorrectCodes } = require("./methods.js")

const { delay, sendToWebhook, webhookURL, anonymization } = require("./config.json");

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
async function validateCode(threadID) {
	let code = generateCode();

	// update the attempts counter
    updateAttempts();
	process.title = `Realm Code Generator - By MrDiamond64 | Total Attempts: ${getAttempts()} | Working Codes: ${getCorrectCodes()} | Checking Code: ${code}`;

	await axios.get(`https://open.minecraft.net/pocket/realms/invite/${code}`, { headers: {
		"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
		"accept-encoding": "gzip, deflate, br",
		"accept-language": "en-US",
		"connection": "keep-alive",
		"DNT": Math.random().toFixed(0),
        "host": "open.minecraft.net",
		"referer": anonymization.referer[~~(Math.random() * anonymization.referer.length)],
		"sec-fetch-dest": "document",
		"sec-fetch-mode": "navigate",
		"sec-fetch-site": "cross-site",
		"sec-fetch-user": "?1",
		"upgrade-insecure-requests": "1",
		"user-agent": anonymization.user_agents[~~(Math.random() * anonymization.user_agents.length)]
	}})
    .then((res) => {
        if(typeof(res) === "object") {
            if(res.status == 200) workingCode(code, threadID);
                else console.log(res.status);
            }
    })
    .catch(function(error) {
		if(!error.response) return;
        if(error.response.status == 404) {
			console.log(chalk.green(`Thread ${threadID} | `) + chalk.red(`https://open.minecraft.net/pocket/realms/invite/${code} is an invalid realm code.`));
			process.stdout.write(`Total Attempts: ${chalk.yellow(getAttempts())} | Working Codes: ${chalk.greenBright(getCorrectCodes())}\r`);
		} else {
			if(error.response.status == 403) {
				console.log(chalk.green(`Thread ${threadID} | `) + `You are being ratelimited! Current thread has been stopped.`)
				process.exit(0);
			} else console.log(chalk.green(`Thread ${threadID} | `) + `Error. Status code: ${error.response.status}`)
		}
	})
}

// This function runs if the code is valid
function workingCode(code, threadID) {
	updateCorrectCodes()
	console.log(chalk.green(`Thread ${threadID} | `) + chalk.greenBright(`Found working code: ${code}. URL: https://open.minecraft.net/pocket/realms/invite/${code}`))
	process.stdout.write(`Total Attempts: ${chalk.yellow(getAttempts())} | Working Codes: ${chalk.greenBright(getCorrectCodes())}\r`);

	// save the code to the working codes data  base
	const workingcodes = JSON.parse(
		fs.readFileSync("./codes/workingcodes.json")
	);

	workingcodes.codes.push(code);
	
	fs.writeFileSync('./codes/workingcodes.json', JSON.stringify(workingcodes));

	// send to webhook stuff
	if(!sendToWebhook) return;

	let embedData = {
		username: "Realm Code Generator",
		embeds: [{
			title: "Working Realm Code Found",
			author: {
				"name": "Realm Code Generator"
			},
			color: 65280,
			description: `https://open.minecraft.net/pocket/realms/invite/${code} is a valid realm code!`,
			timestamp: new Date(),
			thumbnail: {
				url: "https://i.imgur.com/OY1Hz6m.jpg"
			},
			footer: {
				text: "https://github.com/MrDiamond64/realm-code-gen",
			}
		}]
	}

	let data = {
		method: "POST",
		url: webhookURL,
		headers: { "Content-Type": "application/json" },
		data: JSON.stringify(embedData),
	}
 	axios(data)
}

module.exports.startChecking = (threadID) => {
    setInterval(() => {
		validateCode(threadID);
    }, delay);
}