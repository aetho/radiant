const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("settings")
		.setDescription("Return the bot's settings for this guild.")
		.addSubcommand((subcommand) => {
			return subcommand
				.setName("show")
				.setDescription("Show the bot's settings for this guild");
		})
		.addSubcommand((subcommand) => {
			return subcommand
				.setName("reset")
				.setDescription("Reset the bot's settings for this guild");
		}),
	async execute(commandInteraction, keyv) {
		const subcommand = commandInteraction.options.getSubcommand();
		if (subcommand === "show") {
			const data = await keyv.get(commandInteraction.guild.id);
			await commandInteraction.reply(JSON.stringify(data ? data : {}));
		} else if (subcommand === "reset") {
			await keyv.set(commandInteraction.guild.id, null);
			await commandInteraction.reply("Settings cleared");
		}
	},
};
