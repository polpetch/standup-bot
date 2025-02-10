"use strict"; // since I hate not using semicolons

/**
 * Required Imports
 *  - dotenv: .env support
 *  - fs: file system support (for reading ./commands)
 *  - mongoose: mongoDB client
 *  - discord.js: discord (duh)
 *  - schedule: for running the cron jobs
 *  - standup.model: the model for the standup stored in mongo
 */
require("dotenv").config();
import { readdirSync } from "fs";
import { connect, connection } from "mongoose";
import { Client, MessageEmbed, Collection } from "discord.js";
import { scheduleJob, Range } from "node-schedule";
import standupModel, { findByIdAndDelete, find } from "./models/standup.model";

const PREFIX = "!";

const standupIntroMessage = new MessageEmbed()
  .setColor("#ff9900")
  .setTitle("Daily Standup")
  .setURL("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
  .setDescription(
    "This is the newly generated text channel used for daily standups! :tada:"
  )
  .addFields(
    {
      name: "แนะนำตัวค่ะ~",
      value: `สวัสดี! ฉันคือ น้องแต๊นแต๊น (Nong Tan Tan) และฉันจะช่วยดูแลสแตนด์อัปประจำวันของคุณจากนี้ไป 🎤\nหากต้องการดูคำสั่งทั้งหมด ลองใช้ \`${PREFIX}help\` ได้เลย!`,
    },
    {
      name: "เอ๊ะ! ใช้งานยังไง?",
      value: `ก่อนเวลาสแตนด์อัป \`9:00 AM UTC+7\` สมาชิกทุกคนจะต้องส่งข้อความหาฉันทาง DM ด้วยคำสั่ง \`${PREFIX}show\` เพื่อให้ฉันแสดงคำถามสแตนด์อัป หลังจากนั้นพวกเขาจะพิมพ์คำตอบโดยใช้คำสั่ง \`${PREFIX}reply @<optional_serverId> [ข้อความของคุณ]\` ฉันจะบันทึกคำตอบของพวกเขาใน *ห้องลับของข้อมูลพิเศษ* ของฉัน และในช่วงเวลาสแตนด์อัปที่กำหนด ฉันจะนำคำตอบทั้งหมดไปแสดงใน \`#daily-standups\`.`,
    },
    {

      name: "เริ่มต้นใช้งาน",
      value: `*ตอนนี้* ยังไม่มีสมาชิกในสแตนด์อัป! ถ้าจะเพิ่มสมาชิก ลองใช้คำสั่ง \`${PREFIX}am <User>\` ดูจ้ะ~`,
    }
  )
  .setFooter(
    "https://github.com/polpetch/standup-bot",
    "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
  )
  .setTimestamp();

const dailyStandupSummary = new MessageEmbed()
  .setColor("#ff9900")
  .setTitle("Daily Standup")
  .setURL("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
  .setFooter(
    "https://github.com/polpetch/standup-bot",
    "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
  )
  .setTimestamp();

// lists .js files in commands dir
const commandFiles = readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

// init bot client with a collection of commands
const bot = new Client();
bot.commands = new Collection();

// Imports the command file + adds the command to the bot commands collection
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  bot.commands.set(command.name, command);
}

// mongodb setup with mongoose
connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
})
  .catch((e) => console.error(e));

connection.once("open", () => console.log("mongoDB connected"));

bot.once("ready", () => console.log("Discord Bot Ready"));

// when a user enters a command
bot.on("message", async (message) => {
  if (!message.content.startsWith(PREFIX) || message.author.bot) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  if (!bot.commands.has(commandName)) return;

  if (message.mentions.users.has(bot.user.id))
    return message.channel.send(":robot:");

  const command = bot.commands.get(commandName);

  if (command.guildOnly && message.channel.type === "dm") {
    return message.channel.send("Hmm, that command cannot be used in a dm!");
  }

  try {
    await command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.channel.send(`Error 8008135: Something went wrong!`);
  }
});

bot.on("guildCreate", async (guild) => {
  // creates the text channel
  const channel = await guild.channels.create("daily-standups", {
    type: "text",
    topic: "Scrum Standup Meeting Channel",
  });

  // creates the database model
  const newStandup = new standupModel({
    _id: guild.id,
    channelId: channel.id,
    members: [],
    responses: new Map(),
  });

  newStandup
    .save()
    .then(() => console.log("Howdy!"))
    .catch((err) => console.error(err));

  await channel.send(standupIntroMessage);
});

// delete the mongodb entry
bot.on("guildDelete", (guild) => {
  findByIdAndDelete(guild.id)
    .then(() => console.log("Peace!"))
    .catch((err) => console.error(err));
});

/**
 * Cron Job: 9:00:00 AM UTC+7 - Go through each standup and output the responses to the channel
 */
let cron = scheduleJob(
  { hour: 21, minute: 0, dayOfWeek: new Range(0, 4) },
  (time) => {
    console.log(`[${time}] - CRON JOB START`);
    find()
      .then((standups) => {
        standups.forEach((standup) => {
          let memberResponses = [];
          let missingMembers = [];
          standup.members.forEach((id) => {
            if (standup.responses.has(id)) {
              memberResponses.push({
                name: `-`,
                value: `<@${id}>\n${standup.responses.get(id)}`,
              });
              standup.responses.delete(id);
            } else {
              missingMembers.push(id);
            }
          });
          let missingString = "Hooligans: ";
          if (!missingMembers.length) missingString += ":man_shrugging:";
          else missingMembers.forEach((id) => (missingString += `<@${id}> `));
          bot.channels.cache
            .get(standup.channelId)
            .send(
              new MessageEmbed(dailyStandupSummary)
                .setDescription(missingString)
                .addFields(memberResponses)
            );
          standup
            .save()
            .then(() =>
              console.log(`[${new Date()}] - ${standup._id} RESPONSES CLEARED`)
            )
            .catch((err) => console.error(err));
        });
      })
      .catch((err) => console.error(err));
  }
);

bot.login(process.env.DISCORD_TOKEN);
