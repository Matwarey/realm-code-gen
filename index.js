const chalk = require("chalk")
const fs = require("fs");

const { threads } = require("./config.json");
const { kickstart } = require("./thread.js");

function startThreads() {
    for (let t = 0; t < threads; t++) {
	    console.log(chalk.gray(`Starting up thread ${t + 1}`));
	    kickstart(t + 1);
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