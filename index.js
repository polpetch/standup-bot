"use strict";

require("dotenv").config();
const fs = require('fs');
const { Client, MessageEmbed, Collection } = require("discord.js");

const bot = new Client();
bot.commands = new Collection();
bot.mongoose = require('./utils/mongoose');

const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for(const file of commandFiles) {
    const command = require(`./commands/${file}`);
    bot.commands.set(command.name, command);
}

bot.once("ready", () => console.log("ready"));

const PREFIX = "!";

const user = {
  userId: "",
  username: "",
  serverId: "",
  channelId: "",
  date: "",
  message: "",
};

const standup = new MessageEmbed().setColor("#ff9900").setTitle("Daily Standup").setTimestamp();

bot.on("message", (message) => {
    if (!message.content.startsWith(PREFIX) || message.author.bot) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (!bot.commands.has(commandName)) return;

    const command = bot.commands.get(commandName);

    if (command.guildOnly && message.channel.type === "dm") {
      return message.reply("I can't execute that command inside DMs!");
    }

    try {
      command.execute(message, args);
    } catch (error) {
      console.error(error);
      message.reply(`Error 8008135: Something went wrong!`);
    }
});

bot.mongoose.init();
bot.login(process.env.DISCORD_TOKEN);
