const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("settings")
		.setDescription("Return the bot's settings for this guild."),
	async execute(commandInteraction, keyv) {
		const data = await keyv.get(commandInteraction.guild.id);
		await commandInteraction.reply(JSON.stringify(data));
	},
};
