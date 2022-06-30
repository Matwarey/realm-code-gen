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