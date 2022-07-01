const fs = require("fs");
const chalk = require("chalk");	
const { threads } = require("./config.json");
const { startChecking } = require("./thread.js");

for (let i = 0; i < threads; i++) {
	console.log(chalk.gray(`Starting up thread ${i + 1}`));
	startChecking(i + 1);
}

console.clear();
process.on('unhandledRejection', (error) => {
	console.error(error);
});

// repair database
let workingcodes = JSON.parse(
	fs.readFileSync("./codes/workingcodes.json")
);

if(!workingcodes.codes) {
	workingcodes = {};
	workingcodes.codes = [];
	fs.writeFileSync('./codes/workingcodes.json', JSON.stringify(workingcodes));
}
