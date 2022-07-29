const chalk = require("chalk")
const fs = require("fs");
const { Authflow } = require("prismarine-auth");

const { threads, accountEmail, accountPassword } = require("./config.json");
const { kickstart } = require("./thread.js");

const flow = new Authflow(accountEmail, undefined, { password: accountPassword, authTitle: false });

async function startThreads() {
	let xboxToken = await flow.getXboxToken("https://pocket.realms.minecraft.net/")
		.catch(err => {
				console.log(chalk.red(`Error logging into ${accountEmail}: ${err}`));
				process.exit(0);
	});

	console.log(chalk.green(`Successfully logged into Xbox Live as ${xboxToken.userXUID}`));

    for (let t = 0; t < threads; t++) {
	    console.log(chalk.gray(`Starting up thread ${t + 1}`));
	    kickstart(t + 1, `XBL3.0 x=${xboxToken.userHash};${xboxToken.XSTSToken}`);
    }
}

// repair database
let workingcodes = JSON.parse(
	fs.readFileSync("./codes/working_codes.json")
);

if(!workingcodes.codes) {
	workingcodes = {"codes":[]};
	fs.writeFileSync('./codes/working_codes.json', JSON.stringify(workingcodes));
}

startThreads();
// console.clear();

process.on('unhandledRejection', (error) => {
	console.error(error);
});