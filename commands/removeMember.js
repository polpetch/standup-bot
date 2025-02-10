import { findById } from "../models/standup.model";
/**
 * !rm - removes member from standup
 * NOTE: server admin can only preform this operation
 */
export const name = "rm";
export const usage = "@<user> @<optional_user> ...";
export const guildOnly = true;
export const description = "ลบสมาชิกออกจากสแตนด์อัป";
export async function execute(message, args) {
  if (!args.length)
    return message.channel.send(
      "อุ๊ย! คุณต้องแท็กสมาชิก อย่างน้อย หนึ่งคนก่อนนะ!"
    );

  findById(message.guild.id)
    .then((standup) => {
      args.forEach((mention) => {
        if (mention.startsWith("<@") && mention.endsWith(">")) {
          mention = mention.slice(2, -1);

          if (mention.startsWith("!")) mention = mention.slice(1);

          const member = message.guild.members.cache.get(mention);

          if (member && standup.members.indexOf(member.id) != -1)
            standup.members = standup.members.filter(
              (id) => id !== member.id
            );
        }
      });

      standup
        .save()
        .then(() => message.channel.send("อัปเดตสมาชิกเรียบร้อยแล้ว :tada:"))
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
}
