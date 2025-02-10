const standupModel = require("../models/standup.model");
/**
 * !am - Adds a new member to the standup
 * NOTE: server admin can only preform this operation
 */
module.exports = {
  name: "am",
  usage: "@<user> @<optional_user> ...",
  guildOnly: true,
  description: "เพิ่มสมาชิกออกจากสแตนด์อัป",
  async execute(message, args) {
    if (!args.length)
      return message.channel.send(
        "อุ๊ย! คุณต้องแท็กสมาชิก อย่างน้อย หนึ่งคนก่อนนะ!"
      );

    standupModel
      .findById(message.guild.id)
      .then((standup) => {
        args.forEach((mention) => {
          if (mention.startsWith("<@") && mention.endsWith(">")) {
            mention = mention.slice(2, -1);

            if (mention.startsWith("!")) mention = mention.slice(1);

            const member = message.guild.members.cache.get(mention);

            if (member && standup.members.indexOf(member.id) == -1)
              standup.members.push(member.id);
          }
        });

        standup
          .save()
          .then(() => message.channel.send("Members updated :tada:"))
          .catch((err) => {
            console.err(err);
            message.channel.send(
              "โอ๊ย! :scream:! เมทริกซ์รวนแล้ว เกิดข้อผิดพลาดซะงั้น!"
            );
          });
      })
      .catch((err) => {
        console.error(err);
        message.channel.send(
          "โอ๊ย! :scream:! เมทริกซ์รวนแล้ว เกิดข้อผิดพลาดซะงั้น!"
        );
      });
  },
};
