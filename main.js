require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
const storage = require('node-persist');
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
    'iam': async (msg) => {
        let cmd = Utility.parseCommand(msg, prfx);

        // Filter out unassignable roles
        let roles = msg.guild.roles.array().filter(role => {
            if (!role.managed && role.name != '@everyone') return role;
        });

        // Get guild info from storage
        let guild = await storage.getItem(msg.guild.id);
        if (!guild) {
            guild = {};
            await storage.setItem(msg.guild.id, guild);
        }

        if (cmd.func.includes('set')) {
            // Checks
            if (!msg.member.hasPermission('MANAGE_ROLES')) return msg.channel.send('You do not have permission.');
            if (!guild.iamset) guild.iamset = [];

            if (cmd.args.length > 0) {
                // Set choosable roles for iam command
                cmd.args.forEach(async x => {
                    // Find role
                    let role = roles.find(el => { return el.id == x; });
                    // Find if role is already set
                    let storedRole = guild.iamset.find(el => { return el.id == x; });

                    if (role && !storedRole) { // store role if valid role and not already stored
                        guild.iamset.push({ id: role.id, name: role.name });
                        await storage.setItem(msg.guild.id, guild);
                        msg.react('✅');
                    } else { // React accordingly
                        if (storedRole) msg.react('✅');
                        else msg.react('❌');
                    }
                });
            } else {
                let str = '';
                str += 'Please specify roles available for self-assign\n';
                str += `Syntax: \`${prfx}iamset <Role ID> <Role ID>\`\n\n`;


                // Display list of assignable roles
                let rolesList = roles.map(role => { return (`\`${role.id}\`: **${role.name}**`); });
                str += 'Roles in your server:\n';
                str += rolesList.join('\n');
                str += '\n\n';

                // Display currently assignable roles
                if (guild.iamset.length > 0) {
                    let storedRolesList = guild.iamset.map(role => { return (`**${role.name}**`) });
                    str += 'Current self-assigned roles:\n'
                    str += storedRolesList.join(', ');
                }

                msg.channel.send(str);
            }
        } else if (cmd.func.includes('rem')) {
            // Checks
            if (!msg.member.hasPermission('MANAGE_ROLES')) return msg.channel.send('You do not have permission.');
            if (!guild.iamset || guild.iamset.length < 1) return msg.channel.send('No self-assign roles to remove.');


            if (cmd.args.length > 0) { // Remove specified roles for iam command
                cmd.args.forEach(async x => {
                    // Find if role is in storage
                    let storedRole = guild.iamset.find(el => { return el.id == x; });

                    if (storedRole) { // remove role if role is found in storage
                        guild.iamset.splice(guild.iamset.indexOf(storedRole), 1);
                        await storage.setItem(msg.guild.id, guild);
                        msg.react('✅');
                    } else { // React accordingly
                        msg.react('❌');
                    }
                });
            } else { // Send instructions
                let str = 'Please specify roles to be removed from self-assign\n';
                str += `Syntax: \`${prfx}iamrem <Role ID> <Role ID>\`\n\n`;

                // Display list of assignable roles
                let rolesList = roles.map(role => { return (`\`${role.id}\`: **${role.name}**`); });
                str += 'Roles in your server:\n';
                str += rolesList.join('\n');
                str += '\n\n';

                // Display currently assignable roles
                if (guild.iamset.length > 0) {
                    let storedRolesList = guild.iamset.map(role => { return (`**${role.name}**`) });
                    str += 'Current self-assigned roles:\n'
                    str += storedRolesList.join(', ');
                }

                msg.channel.send(str);
            }
        } else if (cmd.func.includes('not')) {
            if (!guild.iamset || guild.iamset.length < 1) return msg.channel.send('No self-assign roles are set.');

            if (cmd.args.length > 0) { // Remove roles from user
                cmd.args.forEach(async x => {
                    // Find role
                    let role = roles.find(el => { return el.id == x; });
                    // Find role from storage
                    let storedRole = guild.iamset.find(el => { return el.id == x });

                    if (role && storedRole) { // Remove role if valid role
                        msg.guild.member(msg.author).removeRole(role);
                        msg.react('✅');
                    } else { // React accordingly
                        msg.react('❌');
                    }
                });
            } else { // Send instructions
                let str = 'Please specify roles you wish to remove\n';
                str += `Syntax: \`${prfx}iamnot <Role ID> <Role ID>\`\n\n`;

                // Display currently assignable roles
                if (guild.iamset.length > 0) {
                    let storedRolesList = guild.iamset.map(role => { return (`\`${role.id}\`: **${role.name}**`) });
                    str += 'Roles available for self-assign:\n'
                    str += storedRolesList.join('\n');
                }

                msg.channel.send(str);
            }
        } else {
            if (!guild.iamset || guild.iamset.length < 1) return msg.channel.send('No self-assign roles are set.');

            if (cmd.args.length > 0) { // Assign roles to user
                cmd.args.forEach(async x => {
                    // Find if role is in storage
                    let storedRole = guild.iamset.find(el => { return el.id == x; });

                    if (storedRole) { // Assign role if role found in storage
                        let role = roles.find(el => { return el.id == storedRole.id });
                        msg.guild.member(msg.author).addRole(role);
                        msg.react('✅');
                    } else { // React accordingly
                        msg.react('❌');
                    }
                });
            } else { // Send instructions
                let str = 'Please specify roles you wish to have\n';
                str += `Syntax: \`${prfx}iam <Role ID> <Role ID>\`\n\n`;

                // Display currently assignable roles
                if (guild.iamset.length > 0) {
                    let storedRolesList = guild.iamset.map(role => { return (`\`${role.id}\`: **${role.name}**`) });
                    str += 'Roles available for self-assign:\n'
                    str += storedRolesList.join('\n');
                }

                msg.channel.send(str);
            }
        }
    }
}

client.on('ready', async () => {
    await storage.init();
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
