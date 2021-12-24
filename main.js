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
function validateCode() {
	let code = generateCode();

	// update the attempts counter
	attempts++;
	process.title = `Realm Code Generator - By MrDiamond64 | Total Attempts: ${attempts} | Working Codes: ${workingCodeCount} | Checking Code: ${code}`;

	// make sure we havent already recorded the code in our database
	const invalidcodes = JSON.parse(
		fs.readFileSync("./codes/invalidcodes.json"),
	);

	if (invalidcodes[code]) return console.log(chalk.gray(`Code ${code} is in our invalid codes database, skipping`));

	axios.get(`https://open.minecraft.net/pocket/realms/invite/${code}`)
        .then((res) => {
            if(typeof(res) == "object") {
                if(res.status == 200) workingCode(code)
                    else console.log(res.status)
            }
        })
        .catch(function(error) {
            console.log(chalk.red(`https://open.minecraft.net/pocket/realms/invite/${code} is an invalid code.`));

            // add the invalid code to our database
            invalidcodes[code] = {
                isInvalid: true
            }
            fs.writeFileSync('./codes/invalidcodes.json', JSON.stringify(invalidcodes));
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