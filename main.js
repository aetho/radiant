require("dotenv").config();
const fs = require("fs");
const { Client, Intents, Collection } = require("discord.js");
const Keyv = require("keyv");
const humanId = require("human-id").humanId;
const token = process.env.DISCORD_TOKEN;

const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_VOICE_STATES,
		Intents.FLAGS.GUILD_PRESENCES,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_MESSAGES,
	],
});
const keyv = new Keyv(process.env.REDISCLOUD_URL);

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
		await command.execute(interaction, keyv);
	} catch (error) {
		console.error(error);
		await interaction.reply({
			content: "There was an error while executing this command!",
			ephemeral: true,
		});
	}
});

const dynamicVoiceChannels = [];
client.on("voiceStateUpdate", async (oldState, newState) => {
	const guildDataStore = await keyv.get(newState.guild.id);
	if (!guildDataStore) return;

	// Check dynamic voice channel
	if (newState.channelId == guildDataStore.dynamicvc) {
		// Create voice channel
		const channelName = humanId({
			separator: " ",
			capitalize: true,
			maxLength: 16,
		});
		const channel = await newState.channel.clone({
			name: channelName,
		});
		dynamicVoiceChannels.push(channel.id);
		// Move newState.member to new voice channel
		newState.member.voice.setChannel(channel);
	}

	// Check if channel empty on update
	if (oldState.channel?.members?.size < 1) {
		const idx = dynamicVoiceChannels.indexOf(oldState.channelId);
		if (idx != -1) {
			// Remove id from dynamic voice channels
			dynamicVoiceChannels.splice(idx, 1);
			// Delete channel
			await oldState.channel.delete();
		}
	}
});

client.once("ready", () => {
	console.log("Ready");
});

client.login(token);
