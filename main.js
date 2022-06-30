const fs = require("fs");
const chalk = require("chalk");	
const { threads } = require("./config.json");
const { startChecking } = require("./thread.js");

for (let i = 0; i < threads; i++) {
	console.log(chalk.gray(`Starting up thread ${i + 1}`));

	// run each thread with a random delay between 500ms to 1500ms
	setTimeout(() => {
		startChecking(i + 1);
	}, Math.floor(Math.random() * (1500 - 500) + 500));
}

console.clear();
process.on('unhandledRejection', (error) => {
	console.error(error);
});

// repair database
let invalidcodes = JSON.parse(
	fs.readFileSync("./codes/invalidcodes.json")
);

let workingcodes = JSON.parse(
	fs.readFileSync("./codes/workingcodes.json")
);

if(!invalidcodes.codes) {
	invalidcodes = {};
	invalidcodes.codes = [];
	fs.writeFileSync('./codes/invalidcodes.json', JSON.stringify(invalidcodes));
}

if(!workingcodes.codes) {
	workingcodes = {};
	workingcodes.codes = [];
	fs.writeFileSync('./codes/workingcodes.json', JSON.stringify(workingcodes));
}
