const chalk = require("chalk");
const fs = require("fs");
const fetch = require("node-fetch");

const { delay, sendToWebhook, xboxAuthToken, autoJoin } = require("./config.json");

const { getAttempts, updateAttempts, getCorrectCodes, updateCorrectCodes } = require("./util/updateCounts.js")
const { send } = require("./util/sendToWebhook.js")

// Generate a random 11 character string
function generateCode() {
	const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890_-";
	let result = "";
	for (let i = 0; i < 11; i++) {
		result += char.charAt(Math.floor(Math.random() * char.length));
	}
	return result;
}

async function validateCode(threadID) {
    let code = generateCode();

    const response = await fetch(`https://pocket.realms.minecraft.net/worlds/v1/link/${code}`, {
	    method: "GET",
	    headers: {
            "Accept": "*/*",
            "authorization": xboxAuthToken,
            "charset": "utf-8",
            "Client-ref": "",
            "client-version": "1.19.2",
            "content-type": "application/json",
            "user-agent": "MCPE/UWP",
            "Accept-Language": "en-CA",
            "Accept-Encoding": "gzip, deflate, br",
            "Host": "pocket.realms.minecraft.net",
            "Connection": "keep-alive"
        }
    });
	
	process.title = `Realm Code Generator - By MrDiamond64 | Total Attempts: ${getAttempts()} | Working Codes: ${getCorrectCodes()} | Checking Code: ${code}`;
	
	if(response.statusText === "Unauthorized" && response.status === 401) {
		console.log(chalk.red(`Error 0: The provided xbox authentication token is invalid.`))
        process.exit(0);
	}
	
    if(response.statusText === "Too Many Requests" && response.status === 429) {
        console.log(chalk.red(`You are being ratelimited! Realm code generator has been stopped.`))
        process.exit(0);
    }

    let realmInfo = await response.json()
      .catch((error) => {
        console.log(`Error 5: ${error}\n${response}`);
        process.exit(0);
      });

    if(realmInfo.errorMsg) {
        if(realmInfo.errorMsg === "Invalid link") {
            updateAttempts();
            console.log(chalk.green(`Thread ${threadID} | `) + chalk.red(`https://open.minecraft.net/pocket/realms/invite/${code} is an invalid realm code.`));
            process.stdout.write(`Total Attempts: ${chalk.yellow(getAttempts())} | Working Codes: ${chalk.greenBright(getCorrectCodes())}\r`);
        } else console.log(`Error 1: ${realmInfo}`)
    } else if(realmInfo.name) {
        updateCorrectCodes();
	    console.log(chalk.green(`Thread ${threadID} | `) + chalk.greenBright(`Found working code: ${code}. URL: https://open.minecraft.net/pocket/realms/invite/${code}`))
	    process.stdout.write(`Total Attempts: ${chalk.yellow(getAttempts())} | Working Codes: ${chalk.greenBright(getCorrectCodes())}\r`);

	    // save the code to the working codes database
	    const workingcodes = JSON.parse(
		    fs.readFileSync("./codes/working_codes.json")
	    );
		
		// if we already found the working code then we skip everything below
		if(workingcodes.codes.includes(code)) return;

	    workingcodes.codes.push(code);
	
	    fs.writeFileSync('./codes/working_codes.json', JSON.stringify(workingcodes));
		
		if(autoJoin) {
			fetch(`https://pocket.realms.minecraft.net/invites/v1/link/accept/${code}`, {
				method: "POST",
				headers: {
					"Accept": "*/*",
					"authorization": xboxAuthToken,
					"charset": "utf-8",
					"Client-ref": "",
					"client-version": "1.19.2",
					"content-type": "application/json",
					"user-agent": "MCPE/UWP",
					"Accept-Language": "en-CA",
					"Accept-Encoding": "gzip, deflate, br",
					"Host": "pocket.realms.minecraft.net",
					"Connection": "keep-alive"
				}
			});
		}
        if(sendToWebhook) send(code, realmInfo);
    } else console.log(`Error 2: ${realmInfo}`);
}

module.exports.kickstart = function(threadID) {
    setInterval(() => {
        validateCode(threadID);
    }, delay);
}