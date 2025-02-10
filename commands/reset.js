const standupModel = require("../models/standup.model");

/**
 * !reset - resets the standup (wipes from database, and re-inits)
 * NOTE: - server admin can only preform this operation
 *       - command only works if text channel has been created already
 */

module.exports = {
  name: "reset",
  guildOnly: true,
  description: "รีเซ็ตสแตนด์อัป",
  async execute(message, args) {
    // Check if user has perms
    if (!message.member.hasPermission("MANAGE_GUILD")) {
      return message.reply("คุณไม่มีสิทธิ์ที่จำเป็นในการทำการนี้!");
    }

    let check = true;
    standupModel.findById(message.guild.id).then(standup => {
      standup.members.forEach(id => { if (standup.responses.has(id)) { standup.responses.delete(id); } });
      standup.members = [];
      standup.save().then(() => message.channel.send("\nรีเซ็ตสแตนด์อัปเสร็จเรียบร้อยแล้ว! :tada:\n*ไม่มีสมาชิกในสแตนด์อัปแล้ว และคำตอบทั้งหมดถูกลบออก!*")).catch(err => {
        console.error(err);
        message.channel.send("โอ๊ะโอ! :scream: เกิดข้อผิดพลาดบางอย่างในระบบ!");
      })
    }).catch(err => {
      console.error(err);
      message.channel.send("โอ๊ะโอ! :scream: เกิดข้อผิดพลาดบางอย่างในระบบ!");
    })
  },
}
  ;
