const { Kirara } = require("@kiznavierr/kirara");

module.exports = {
  help: ["profilehsr"],
  use: "uid",
  tags: "internet",
  run: async (m, { conn, usedPrefix, command, text, Func }) => {
    try {
      if (!text) throw Func.example(usedPrefix, command, "800069903");
      conn.sendReact(m.chat, "🕒", m.key);
      const kirara = new Kirara("hsr");
      const data = await kirara.getPlayerSummary(text, { lang: "en" });
      if (!data) throw "Profile not found or invalid UID.";
      let txt = `乂  *H O N K A I   S T A R   R A I L   P R O F I L E*\n\n`;
      txt += `   ◦  *Nickname* : ${data.nickname}\n`;
      txt += `   ◦  *Level* : ${data.level}\n`;
      txt += `   ◦  *Platform* : ${data.platform}\n`;
      txt += `   ◦  *Achievements* : ${data.recordInfo.achievementCount}\n`;
      txt += `   ◦  *Book Count* : ${data.recordInfo.bookCount}\n`;
      txt += `   ◦  *Avatar Count* : ${data.recordInfo.avatarCount}\n`;
      txt += `   ◦  *Equipment Count* : ${data.recordInfo.equipmentCount}\n`;
      txt += `   ◦  *Music Count* : ${data.recordInfo.musicCount}\n`;
      txt += `   ◦  *Relic Count* : ${data.recordInfo.relicCount}\n`;
      txt += `   ◦  *Max Rogue Score* : ${data.recordInfo.maxRogueChallengeScore}\n`;
      txt += `   ◦  *UID* : ${data.uid}\n`;
      txt += `   ◦  *Region* : ${data.region}\n\n`;
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
