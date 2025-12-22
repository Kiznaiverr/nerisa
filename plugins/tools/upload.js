module.exports = {
   help: ['upload'],
   aliases: ['tourl'],
   use: 'reply media',
   tags: 'tools',
   run: async (m, {
      conn,
      Scraper,
      Func
   }) => {
      try {
         let q = m.quoted ? m.quoted : m
         let mime = (q.msg || q).mimetype || ''
         if (!mime) throw Func.texted('bold', '🚩 Send or reply to the media you want to upload.')
         conn.sendReact(m.chat, '🕒', m.key)
         let media = await q.download()
         let fileName = `upload_${Date.now()}`
         // Try Discord CDN first
         let json = await require('../../lib/system/discordCDN')(media, fileName)
         if (json.status && json.data.result.attachments && json.data.result.attachments[0]) {
            conn.reply(m.chat, json.data.result.attachments[0].url, m)
         } else {
            // Fallback to tmpfiles
            json = await Scraper.tmpfiles(media)
            conn.reply(m.chat, json.data.url, m)
         }
      } catch (e) {
         throw Func.jsonFormat(e)
      }
   },
   limit: true
}