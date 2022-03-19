const { ContextMenuCommandBuilder } = require("@discordjs/builders");
const { ApplicationCommandType } = require("discord-api-types/v9");

module.exports = {
	data: new ContextMenuCommandBuilder()
		.setType(ApplicationCommandType.Message)
		.setDefaultPermission(true)
		.setName("Mock"),
	async execute(contextInteraction) {
		const targetId = contextInteraction.targetId;
		const msg = await contextInteraction.channel.messages.fetch(targetId);
		let content = msg.content.toLowerCase();

		for (let i = 0; i < content.length; i++) {
			if (i % 2 == 1) {
				content =
					content.substr(0, i) +
					content.charAt(i).toUpperCase() +
					content.substr(i + 1);
			}
		}

		await contextInteraction.reply(content);
	},
};
