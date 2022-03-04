const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageActionRow, MessageSelectMenu } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("setdynamicvc")
		.setDescription(
			"Sets the provided voice channel as a dynamic voice channel."
		),
	async execute(commandInteraction, keyv) {
		// Construct select menu
		const channels = await commandInteraction.guild.channels.fetch();
		const voiceChannels = channels.filter((el) => el.type === "GUILD_VOICE");
		const row = new MessageActionRow().addComponents(
			new MessageSelectMenu()
				.setCustomId("setdynamicvcselect")
				.setPlaceholder("Select Channel")
				.addOptions(
					voiceChannels.map((el) => {
						return {
							label: `${el.name}`,
							description: `ID: ${el.id}`,
							value: el.id,
						};
					})
				)
		);

		// Send select menu
		const msg = await commandInteraction.reply({
			content: "Select dynamic voice channel",
			components: [row],
			fetchReply: true,
		});

		// Create select collector
		const collector = msg.createMessageComponentCollector({
			componentType: "SELECT_MENU",
			time: 7000,
		});

		// Handle selections
		const replies = [];
		collector.on("collect", async (selectInteraction) => {
			if (selectInteraction.user.id === commandInteraction.user.id) {
				const choice = voiceChannels.get(selectInteraction.values[0]).name;
				const choiceID = voiceChannels.get(selectInteraction.values[0]).id;

				const currentData = await keyv.get(commandInteraction.guild.id);
				await keyv.set(commandInteraction.guild.id, {
					...currentData,
					dynamicvc: choiceID,
				});

				const reply = await selectInteraction.reply({
					content: `Dynamic voice channel has been set to \`${choice}\`.`,
					fetchReply: true,
				});

				replies.push(reply);
			} else {
				selectInteraction.reply({
					content: "These buttons aren't for you!",
					ephemeral: true,
				});
			}
		});

		collector.on("end", async () => {
			// Update inital reply to reflect selection
			const editContent =
				replies.length < 1
					? "No channel was selected."
					: replies[replies.length - 1].content;
			await msg.edit({
				content: editContent,
				components: [],
			});

			// Remove clutter
			replies.forEach(async (el) => {
				await el.delete();
			});
		});
	},
};
