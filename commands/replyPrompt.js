const standupModel = require("../models/standup.model");


module.exports = {
  name: "reply",
  usage: "@<optional_serverId> [ข้อความของคุณที่นี่]",
  description: "ตอบกลับคำถามจากสแตนด์อัป",
  execute(message, args) {
    if (message.channel.type === "dm") {
      if (!args.length || (args.length == 1 && args[0].startsWith("@")))
        return message.reply(
          "โอ๊ะโอ! คุณต้องส่งข้อความตอบกลับนะ ไม่งั้นจะเหมือนวิญญาณที่ไม่มีตัวตนเลยนะ :ghost: :exclamation: :anger:"
        );

      if (args[0].startsWith("@")) {
        standupModel
          .findById(args[0].slice(1))
          .then((standup) => {
            if (standup.members.indexOf(message.author.id) !== -1) {
              standup.responses.set(
                message.author.id,
                args.splice(1).join(" ")
              );

              standup
                .save()
                .then(() => message.channel.send("อัปเดตคำตอบแล้ว :tada:"))
                .catch((err) => {
                  console.error(err);
                  message.channel.send(
                    "โอ๊ะโอ! :scream: เกิดข้อผิดพลาดบางอย่างในระบบ!"
                  );
                });
            } else {
              message.channel.send(
                "โอ๊ะโอ! คุณต้องเป็นสมาชิกในสแตนด์อัปเซิร์ฟเวอร์นี้ถึงจะตอบกลับได้!"
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
                "โอ๊ะโอ! คุณต้องเป็นสมาชิกในสแตนด์อัปเซิร์ฟเวอร์ ***__ใดก็ได้__*** ถึงจะตอบกลับได้!"
              );
            } else if (userStandupList.length > 1) {
              message.channel.send(
                "โอ๊ะโอ! ดูเหมือนว่าคุณเป็นสมาชิกในหลายเซิร์ฟเวอร์สแตนด์อัป!\nลองใช้ `!reply @<serverId> [ข้อความของคุณที่นี่]` ถ้าคุณต้องการตอบกลับเซิร์ฟเวอร์สแตนด์อัปเฉพาะ\n**_เคล็ดลับน่ารู้:_** ถ้าคุณต้องการหาค่า serverId ของเซิร์ฟเวอร์ใดก็ได้ ให้คลิกขวาที่ไอคอนเซิร์ฟเวอร์แล้วเลือก `Copy ID`\nอย่าลืมเปิด Developer options ด้วยนะ!"
              );
            } else {
              let [standup] = userStandupList;
              standup.responses.set(
                message.author.id,
                args.join(" ")
              );
              standup
                .save()
                .then(() => message.channel.send("อัปเดตคำตอบแล้ว :tada:"))
                .catch((err) => {
                  console.error(err);
                  message.channel.send(
                    "โอ๊ะโอ! :scream: เกิดข้อผิดพลาดบางอย่างในระบบ!"
                  );
                });
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
      return message.reply("ส่งข้อความมาหาฉันทาง DM ด้วยคำสั่ง `!reply` :bomb:");
    }
  },
};
;
