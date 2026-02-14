const { Kirara } = require("@kiznavierr/kirara");

module.exports = {
  help: ["profilezzz"],
  use: "uid",
  tags: "internet",
  run: async (m, { conn, usedPrefix, command, text, Func }) => {
    try {
      if (!text) throw Func.example(usedPrefix, command, "1500422486");
      conn.sendReact(m.chat, "🕒", m.key);
      const kirara = new Kirara("zzz");
      const data = await kirara.getPlayerSummary(text, { lang: "en" });
      if (!data) throw "Profile not found or invalid UID.";
      let txt = `乂  *Z E N L E S S   Z O N E   Z E R O*\n\n`;
      txt += `   ◦  *Nickname* : ${data.nickname}\n`;
      txt += `   ◦  *Level* : ${data.level}\n`;
      txt += `   ◦  *Signature* : ${data.signature || "N/A"}\n`;
      txt += `   ◦  *Region* : ${data.region}\n`;
      txt += `   ◦  *UID* : ${data.uid}\n`;
      txt += `   ◦  *Avatar Count* : ${data.avatarIds.length}\n\n`;
      txt += global.footer;
      if (data.cardUrl) {
        await conn.sendFile(m.chat, data.cardUrl, "profile.jpg", txt, m);
      } else {
        conn.reply(m.chat, txt, m);
      }
    } catch (e) {
      console.error(e);
      throw Func.jsonFormat(e);
    }
  },
};
