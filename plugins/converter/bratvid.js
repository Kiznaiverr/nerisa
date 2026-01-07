module.exports = {
  help: ["bratvid"],
  use: "text",
  tags: "converter",
  run: async (m, { conn, usedPrefix, command, text, setting, Func }) => {
    try {
      if (!text.trim()) throw Func.example(usedPrefix, command, "lu asik bang");
      if (text.length > 100)
        throw Func.texted("bold", "🚩 Text is too long, max 100 characters.");
      conn.sendReact(m.chat, "🕒", m.key);
      const url = `https://brat.siputzx.my.id/gif?text=${encodeURIComponent(
        text
      )}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch");
      const buffer = await response.arrayBuffer();
      conn.sendSticker(m.chat, Buffer.from(buffer), m, {
        packname: setting.sk_pack,
        author: setting.sk_author,
      });
    } catch (e) {
      throw Func.jsonFormat(e);
    }
  },
  limit: true,
  error: false,
};
