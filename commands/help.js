const PREFIX = "!";

/**
 * !help command - Lists out all the available commands
 */
export const name = "help";
export const description = "Shows all commands";
export const usage = "[command name]";
export function execute(message, args) {
  const data = [];
  const { commands } = message.client;

  /**
   * If the user wants all the commands
   */
  if (!args.length) {
    data.push("มาแล้ว! นี่คือคำสั่งทั้งหมดที่ฉันมีให้ใช้!:");
    let cmds = "";
    commands.forEach(command => {
      cmds += (`\`${PREFIX}${command.name}\``).padEnd(6, '\t');
      if (command.description) cmds += `\t*${command.description}*\n`;
    });
    data.push(cmds);
    data.push(
      `ลองพิมพ์ \`${PREFIX}help [ชื่อคำสั่ง]\` แล้วมาดูกันว่ามีอะไรบ้าง!`
    );

    return message.channel.send(data, { split: true }).catch((error) => {
      console.error(error);
      message.reply(
        "ศูนย์ควบคุม! ระบบรวนแล้ว ช่วยด้วย!"
      );
    });
  }

  /**
   * If the user specifies a command
   */
  const name = args[0].toLowerCase();
  const command = commands.get(name) ||
    commands.find((c) => c.aliases && c.aliases.includes(name));

  if (!command) {
    return message.reply(
      "โอ๊ะโอ! ไม่มีคำสั่งนี้นะ ลองใหม่อีกที!"

    );
  }

  data.push(`**Name:** ${command.name}`);

  if (command.description)
    data.push(`**Description:** *${command.description}*`);
  if (command.usage)
    data.push(`**Usage:** \`${PREFIX}${command.name} ${command.usage}\``);

  data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

  message.channel.send(data, { split: true });

}
