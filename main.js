const Discord = require("discord.js");
const client = new Discord.Client();
require('dotenv').config();
const prfx = process.env.PFX;

class Utility {
    static parseCommand(msg, prfx) {
        let content;
        if (msg.content.startsWith(prfx)) {
            content = msg.content.split(prfx, 2)[1].split(' ');
        } else if (msg.isMemberMentioned(client.user)) {
            content = msg.content.split(client.user, 2)[1].split(' ');
        }

        if (content[0] == '') content.shift();
        return { func: content[0], args: content.slice(1) };
    }
}

const commands = {
    'eval': (msg) => {
        let cmd = Utility.parseCommand(msg, prfx);
        try {
            msg.channel.send({
                embed: {
                    color: 3447003,
                    fields: [
                        {
                            name: "✅ INPUT",
                            value: `\`\`\`js\n${cmd.args.join(' ')}\`\`\``
                        },
                        {
                            name: "➡ OUTPUT",
                            value: `\`\`\`js\n${eval(cmd.args.join(' '))}\`\`\``
                        }
                    ]
                }
            });
        } catch (e) {
            msg.channel.send({
                embed: {
                    color: 3447003,
                    fields: [
                        {
                            name: "❌ INPUT",
                            value: `\`\`\`js\n${cmd.args.join(' ')}\`\`\``
                        },
                        {
                            name: "➡ OUTPUT",
                            value: `\`\`\`js\n${e.message}\`\`\``
                        }
                    ]
                }
            });
        }
    },
    'iam': (msg) => {
        let roles = msg.guild.roles.array();
        let roleNames = roles.map(x => x.name);
        roleNames.splice(roleNames.indexOf('@everyone'), 1);
        msg.channel.send(roleNames);
    },
    'invite': (msg) => {
        msg.channel.send(`https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot`);
    }
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', (msg) => {
    if (msg.author.id == '139034967958224896') {
        if (msg.content.startsWith(prfx) || msg.isMemberMentioned(client.user)) {
            console.log(`Message acknowledged: ${msg.content}`);
            // console.log(Utility.parseCommand(msg, prfx));

            let cmd = Utility.parseCommand(msg, prfx);
            if (commands.hasOwnProperty(cmd.func)) commands[cmd.func](msg);

        }
    }
});

client.login(process.env.DISCORD_TOKEN);
