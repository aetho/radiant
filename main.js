const Discord = require('discord.js');
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
    'help': (msg) => {
        msg.channel.send(`My current commands are: \`${Object.keys(commands).join(', ')}\``);
    },
    'eval': (msg) => {
        if (msg.author.id != '139034967958224896') {
            return msg.channel.send('You do not have permission to use this command.');
        }
        let cmd = Utility.parseCommand(msg, prfx);
        try {
            msg.channel.send({
                embed: {
                    color: 3447003,
                    fields: [
                        {
                            name: '✅ INPUT',
                            value: `\`\`\`js\n${cmd.args.join(' ')}\`\`\``
                        },
                        {
                            name: '➡ OUTPUT',
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
                            name: '❌ INPUT',
                            value: `\`\`\`js\n${cmd.args.join(' ')}\`\`\``
                        },
                        {
                            name: '➡ OUTPUT',
                            value: `\`\`\`js\n${e.message}\`\`\``
                        }
                    ]
                }
            });
        }
    },
    'invite': (msg) => {
        msg.channel.send(`https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot`);
    },
    'iam': (msg) => {
        let cmd = Utility.parseCommand(msg, prfx);

        // Filter out unassignable roles
        let roles = msg.guild.roles.array().filter(role => {
            if (!role.managed && role.name != '@everyone') return role;
        });

        if (cmd.func.includes('set')) {
            if (cmd.args.length > 0) {
                // Set choosable roles for iam command
                msg.channel.send('WIP');
            } else {
                // Display list of assignable roles
                let roleList = roles.map(role => {
                    if (!role.managed && role.name != '@everyone') return (`**${role.name}** \`id: ${role.id}\``);
                });
                let str = 'Please specify roles that people can choose from\n';
                str += `Syntax: \`${prfx}iamset <Role ID> <Role ID>\`\n`;
                str += 'Here are the roles of your server:\n';
                str += roleList.join('\n');
                msg.channel.send(str, { disableEveryone: true });
            }
        } else if (cmd.func.includes('rem')) {
            //Remove choosable roles for iam command
            msg.channel.send('WIP');
        } else {
            //Assign role to user
            msg.channel.send('WIP');
        }
    }
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', (msg) => {
    if (msg.author == client.user) return;
    if (msg.content.startsWith(prfx) || msg.isMemberMentioned(client.user)) {
        console.log(`Message acknowledged: ${msg.content}`);

        let cmd = Utility.parseCommand(msg, prfx);
        Object.keys(commands).forEach(key => {
            if (cmd.func.startsWith(key)) commands[key](msg);
        });
    }
});

client.login(process.env.DISCORD_TOKEN);
