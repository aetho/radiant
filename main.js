var Discord = require("discord.js");
var client = new Discord.Client();
var credentials = require("./credentials.json");

client.on('ready', function () {
    console.log("Logged in as " + client.user.tag);
});

client.on('message', function (msg) {
    if (msg.author.id == "139034967958224896") {
        if(msg.content.startsWith('>') || msg.isMemberMentioned(client.user) ){
            console.log('Message acknowledged');
        }
    }
});

client.login(credentials.discord);
