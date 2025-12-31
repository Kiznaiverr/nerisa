const fs = require("fs");
const path = require("path");

module.exports = {
  help: ["spamjmk"],
  use: "nomor atau reply",
  tags: "owner",
  run: async (m, { conn, usedPrefix, command, args, Func }) => {
    try {
      let target;
      if (m.quoted) {
        target = m.quoted.sender;
      } else if (args[0]) {
        let number = args[0].replace(/[^0-9]/g, "");
        let jid = number + "@s.whatsapp.net";
        let user = global.db.users[jid];
        target = user?.lid || jid;
      } else {
        return conn.reply(
          m.chat,
          Func.example(usedPrefix, command, "62123456789"),
          m
        );
      }

      const folder = path.join(__dirname, "../../lib/assets/danger/jmk");
      if (!fs.existsSync(folder))
        return conn.reply(
          m.chat,
          Func.texted("bold", `🚩 Folder tidak ditemukan`),
          m
        );

      const files = fs.readdirSync(folder).filter((f) => f.endsWith(".webp"));
      if (files.length === 0)
        return conn.reply(
          m.chat,
          Func.texted("bold", `🚩 Tidak ada sticker di folder`),
          m
        );

      for (const file of files) {
        const filePath = path.join(folder, file);
        const buffer = fs.readFileSync(filePath);
        await conn.sendMessage(target, { sticker: buffer }, { quoted: m });
        await Func.delay(200); // delay 0.2 detik antar kirim
      }

      conn.reply(
        m.chat,
        Func.texted(
          "bold",
          `🚩 Berhasil kirim ${files.length} sticker ke ${target}`
        ),
        m
      );
    } catch (e) {
      console.error(e);
      conn.reply(m.chat, Func.texted("bold", `🚩 Error: ${e.message}`), m);
    }
  },
  owner: true,
};
