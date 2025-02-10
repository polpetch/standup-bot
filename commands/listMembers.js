const standupModel = require("../models/standup.model");

/**
 * !list - list all participating members
 */
module.exports = {
  name: "list",
  guildOnly: true,
  description: "รายชื่อสมาชิกทั้งหมดที่เข้าร่วมสแตนด์อัป",
  execute(message, args) {
    standupModel.findById(message.guild.id).then(standup => {
      let res = "รายชื่อสมาชิกที่เข้าร่วมการสแตนด์อัปทั้งหมด:\n";
      if (!standup.members.length) {
        message.reply("ดูเหมือนว่าจะไม่มีสมาชิกในสแตนด์อัป ลองใช้ `!am @<user> @<optional_user> ...` เพื่อเพิ่มสมาชิกดูนะ!")
      } else {
        standup.members.forEach(member => {
          res += `<@${member}>\t`;
        });
        message.channel.send(res);
      }
    }).catch(err => {
      console.error(err);
      message.channel.send(
        "โอ๊ย! :scream:! เมทริกซ์รวนแล้ว เกิดข้อผิดพลาดซะงั้น!"
      );
    })
  },
};
