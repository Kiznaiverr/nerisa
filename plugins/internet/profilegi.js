const { Kirara } = require("@kiznavierr/kirara");

module.exports = {
  help: ["profilegi"],
  use: "uid",
  tags: "internet",
  run: async (m, { conn, usedPrefix, command, text, Func }) => {
    try {
      if (!text) throw Func.example(usedPrefix, command, "856012067");
      conn.sendReact(m.chat, "🕒", m.key);
      const kirara = new Kirara("genshin");
      const data = await kirara.getPlayerSummary(text, { lang: "en" });
      if (!data) throw "Profile not found or invalid UID.";
      let txt = `乂  *G E N S H I N   I M P A C T   P R O F I L E*\n\n`;
      txt += `   ◦  *Nickname* : ${data.nickname}\n`;
      txt += `   ◦  *Level* : ${data.level}\n`;
      txt += `   ◦  *Signature* : ${data.signature || "N/A"}\n`;
      txt += `   ◦  *World Level* : ${data.worldLevel}\n`;
      txt += `   ◦  *Achievements* : ${data.finishAchievementNum}\n`;
      txt += `   ◦  *Spiral Abyss Floor* : ${data.towerFloorIndex}\n`;
      txt += `   ◦  *Spiral Abyss Level* : ${data.towerLevelIndex}\n`;
      txt += `   ◦  *Spiral Abyss Stars* : ${data.towerStarIndex}\n`;
      if (data.theaterActIndex)
        txt += `   ◦  *Imaginarium Theater Act* : ${data.theaterActIndex}\n`;
      if (data.theaterModeIndex)
        txt += `   ◦  *Imaginarium Theater Mode* : ${data.theaterModeIndex}\n`;
      if (data.theaterStarIndex)
        txt += `   ◦  *Imaginarium Theater Stars* : ${data.theaterStarIndex}\n`;
      txt += `   ◦  *Fetter Count* : ${data.fetterCount}\n`;
      txt += `   ◦  *Stygian Onslaught* : ${data.stygianIndex}\n`;
      if (data.stygianSeconds)
        txt += `   ◦  *Stygian Time* : ${Math.floor(data.stygianSeconds / 60)}m ${data.stygianSeconds % 60}s\n`;
      txt += `   ◦  *Avatar Count* : ${data.avatarIds.length}\n`;
      txt += `   ◦  *UID* : ${text}\n\n`;
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
