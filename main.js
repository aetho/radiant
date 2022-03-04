require("dotenv").config();
const fs = require("fs");
const { Client, Intents, Collection } = require("discord.js");
const token = process.env.DISCORD_TOKEN;

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.commands = new Collection();
const commandFiles = fs
	.readdirSync("./commands")
	.filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

client.on("interactionCreate", async (interaction) => {
	const command = client.commands.get(interaction.commandName);
	if (!command) return;

	try {
		if (interaction.isCommand()) {
			await command.execute(interaction);
		} else if (interaction.isSelectMenu()) {
			await command.select(interaction);
		} else if (interaction.isButton()) {
			await command.button(interaction);
		}
	} catch (error) {
		console.error(error);
		await interaction.reply({
			content: "There was an error while executing this command!",
			ephemeral: true,
		});
	}
});

client.once("ready", () => {
	console.log("Ready");
});

client.login(token);
