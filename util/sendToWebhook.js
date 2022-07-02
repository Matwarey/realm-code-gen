const chalk = require("chalk");
const fetch = require("node-fetch")
const { webhookURL } = require("../config.json");

module.exports.send = async function(code, realmInfo) {
    if(!webhookURL || !webhookURL.startsWith("https://discord.com/api/webhooks/")) return console.log(chalk.red("Error 3: An invalid webhook was provided."))

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
			fields: [
				{
					name: "Realm Name",
					value: realmInfo.name,
					inline: true
				},
				{
					name: "Realm ID",
					value: realmInfo.id,
					inline: true
				},
				{
					name: "Status",
					value: realmInfo.state,
					inline: true
				},
				{
					name: "Realm Owner XUID",
					value: realmInfo.ownerUUID,
					inline: true
				},
				{
					name: "Default Permission",
					value: realmInfo.defaultPermission,
					inline: true
				}
			],
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
		headers: {
			"Content-Type": "application/json"
		},
        body: JSON.stringify(embedData)
    })
}
