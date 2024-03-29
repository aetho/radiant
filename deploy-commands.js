require("dotenv").config();
const fs = require("fs");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { DISCORD_TOKEN, GUILD_ID, CLIENT_ID } = process.env;

const commands = [];
const commandFiles = fs
	.readdirSync("./commands")
	.filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: "9" }).setToken(DISCORD_TOKEN);

// Dev
rest
	.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands })
	.then(() => console.log("Successfully registered application commands."))
	.catch(console.error);

// Deploy
// rest
// 	.put(Routes.applicationCommands(CLIENT_ID), { body: commands })
// 	.then(() => console.log("Successfully registered application commands."))
// 	.catch(console.error);
