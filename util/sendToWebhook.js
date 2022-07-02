const chalk = require("chalk");
const fetch = require("node-fetch")
const { webhookURL } = require("../config.json");

module.exports.send = function(code, realmInfo) {
    // this webhook function doesnt work right now, plan to fix it later

    if(!webhookURL) return console.log(chalk.red("Error 3: An invalid webhook was provided."))

	const embedData = {
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

	fetch(webhookURL, {
        method: "POST",
        body: embedData
    })
    .catch(error => {
        console.log(error);
    })
}
