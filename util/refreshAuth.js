const { Authflow } = require("prismarine-auth");

const { accountEmail, accountPassword } = require("../config.json");

module.exports.refreshAuth = async function() {
    console.log(`Refreshing xbox authentication token...`);

    const flow = new Authflow(accountEmail, undefined, { password: accountPassword, authTitle: false });

    let xboxToken = await flow.getXboxToken("https://pocket.realms.minecraft.net/")
		.catch(err => {
				console.log(chalk.red(`Error logging into ${accountEmail}: ${err}`));
				process.exit(0);
	});

    console.log(`Successfully logged into Xbox Live as ${xboxToken.userXUID}`);

	return `XBL3.0 x=${xboxToken.userHash};${xboxToken.XSTSToken}`;
}