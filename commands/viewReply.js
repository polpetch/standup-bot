const standupModel = require("../models/standup.model");


module.exports = {
  name: "view",
  usage: "@<optional_serverId>",
  description: "ดูคำตอบจากสแตนด์อัปของคุณ",
  execute(message, args) {
    if (message.channel.type === "dm") {
      if (args.length == 1 && !args[0].startsWith("@")) {
        return message.reply(
          "โอ๊ะโอ! คำสั่งนี้ไม่ถูกต้อง ลองใช้ `!help view` เพื่อข้อมูลเพิ่มเติมนะ!"
        );
      } else if (args.length && args[0].startsWith("@")) {
        standupModel
          .findById(args[0].slice(1))
          .then((standup) => {
            if (standup.members.indexOf(message.author.id) !== -1) {
              if (standup.responses.has(message.author.id)) {
                message.reply(
                  "นี่คือคำตอบของคุณ:\n" +
                  standup.responses.get(message.author.id)
                );
              } else {
                message.reply(
                  "โอ๊ะโอ! ดูเหมือนคุณยังไม่มีคำตอบ! เพิ่มคำตอบของคุณโดยใช้คำสั่ง `!reply @<optional_serverId> [ข้อความของคุณ]`."
                );
              }
            } else {
              message.channel.send(
                "โอ๊ะโอ! คุณต้องเป็นสมาชิกในสแตนด์อัปเซิร์ฟเวอร์นี้ถึงจะดูคำตอบได้!"
              );
            }
          })
          .catch((err) => {
            console.error(err);
            message.channel.send(
              "โอ๊ะโอ! :scream: เกิดข้อผิดพลาดบางอย่างในระบบ!"
            );
          });
      } else {
        standupModel
          .find()
          .then((standups) => {
            const userStandupList = standups.filter(
              (standup) => standup.members.indexOf(message.author.id) !== -1
            );

            if (!userStandupList.length) {
              message.channel.send(
                "โอ๊ะโอ! คุณต้องเป็นสมาชิกในสแตนด์อัปเซิร์ฟเวอร์ ***__อย่างน้อยหนึ่ง__*** เซิร์ฟเวอร์ถึงจะดูคำตอบได้!"
              );
            } else if (userStandupList.length > 1) {
              message.channel.send(
                "โอ๊ะโอ! ดูเหมือนว่าคุณเป็นสมาชิกในหลายเซิร์ฟเวอร์สแตนด์อัป!\nลองใช้ `!view @<serverId>` ถ้าคุณต้องการดูคำตอบจากสแตนด์อัปเซิร์ฟเวอร์เฉพาะ\n**_เคล็ดลับน่ารู้:_** ถ้าคุณต้องการหาค่า serverId ของเซิร์ฟเวอร์ใดก็ได้ ให้คลิกขวาที่ไอคอนเซิร์ฟเวอร์แล้วเลือก `Copy ID`\nอย่าลืมเปิด Developer options ด้วยนะ!"
              );
            } else {
              let [standup] = userStandupList;
              if (standup.responses.has(message.author.id)) {
                message.reply(
                  "นี่คือคำตอบของคุณ:\n" +
                  standup.responses.get(message.author.id)
                );
              } else {
                message.reply(
                  "โอ๊ะโอ! ดูเหมือนคุณยังไม่มีคำตอบ! เพิ่มคำตอบของคุณโดยใช้คำสั่ง `!reply @<optional_serverId> [ข้อความของคุณ]`."
                );
              }
            }
          })
          .catch((err) => {
            console.error(err);
            message.channel.send(
              "โอ๊ะโอ! :scream: เกิดข้อผิดพลาดบางอย่างในระบบ!"
            );
          });
      }
    } else {
      return message.reply("ส่งข้อความมาหาฉันทาง DM ด้วยคำสั่ง `!view` :bomb:");
    }
  },
};
;
