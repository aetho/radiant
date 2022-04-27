const { SlashCommandBuilder } = require("@discordjs/builders");
const axios = require("axios").default;

module.exports = {
	data: new SlashCommandBuilder()
		.setName("lostark")
		.setDescription("Lost Ark related commands")
		.addSubcommand((subcommand) => {
			return subcommand
				.setName("status")
				.setDescription("Show status of all servers");
		}),
	async execute(commandInteraction) {
		const subcommand = commandInteraction.options.getSubcommand();
		if (subcommand === "status") {
			try {
				const res = await axios.get(
					"https://lastarkapi-m2.herokuapp.com/server/all"
				);
				const replyString = Object.entries(res.data.data)
					.map((val) => {
						return `${val[0]}: ${val[1]}`;
					})
					.join("\n");
				commandInteraction.reply({ content: replyString });
			} catch (err) {
				console.log(err);
			}
		}
	},
};
