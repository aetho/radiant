const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageActionRow, MessageButton } = require("discord.js");
const moment = require("moment-timezone");
const lostark = require("../resources/lostark.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("lostark")
		.setDescription("Lost Ark related commands")
		.addSubcommand((subcommand) => {
			return subcommand
				.setName("merchant")
				.setDescription("Shows merchants that can spawn right now");
		}),
	async execute(commandInteraction) {
		const subcommand = commandInteraction.options.getSubcommand();
		if (subcommand === "merchant") {
			const serverHour = Number(moment().tz("US/Pacific").format("h"));
			const serverMinutes = Number(moment().tz("US/Pacific").format("mm"));

			let msgContent;
			let currMerchant;
			if (serverMinutes >= 30 && serverMinutes < 55) {
				currMerchant = lostark.wanderingMerchant[serverHour + ":30"];
			}

			// Build reply
			const rows = [];
			if (currMerchant) {
				msgContent = "Current Merchants: ";
				for (let i = 0, cnt = 0; i < 5 && cnt < currMerchant.length; i++) {
					const row = new MessageActionRow();
					for (let j = 0; j < 5 && cnt < currMerchant.length; j++, cnt++) {
						row.addComponents(
							new MessageButton()
								.setStyle("LINK")
								.setLabel(currMerchant[cnt])
								.setURL(
									"https://lost-ark.maxroll.gg/resources/wandering-merchant-guide#wandering-merchant-npc-locations-a280968f-b483-439c-b008-8c604b4e3cf8"
								)
						);
					}
					rows.push(row);
				}
			} else {
				msgContent = "No merchants currently spawned.";
			}

			// Send reply
			await commandInteraction.reply({
				content: msgContent,
				components: rows,
			});
		}
	},
};
