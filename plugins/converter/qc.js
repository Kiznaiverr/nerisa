const axios = require('axios')

module.exports = {
   help: ['qc'],
   use: 'text',
   tags: 'converter',
   run: async (m, {
      conn,
      usedPrefix,
      command,
      text,
      setting,
      Func
   }) => {
      try {
         if (!text) throw Func.example(usedPrefix, command, 'Hi!')
         let pic = await conn.profilePictureUrl(m.quoted ? m.quoted.sender : m.sender, 'image').catch(() => 'https://i.pinimg.com/736x/f7/82/c8/f782c8360e890a8d488eeda004b26bde.jpg')
         conn.sendReact(m.chat, '🕒', m.key)
         const json = {
            "type": "quote",
            "format": "png",
            "backgroundColor": "#0C0C0C",
            "width": 512,
            "height": 768,
            "scale": 2,
            "messages": [{
               "entities": [],
               "avatar": true,
               "from": {
                  "id": 1,
                  "name": m.quoted ? m.quoted.name : m.name,
                  "photo": {
                     "url": pic
                  }
               },
               "text": text,
               "replyMessage": {}
            }]
         }
         const response = await axios.post('https://bot.lyo.su/quote/generate', json, {
            headers: {
               'Content-Type': 'application/json'
            }
         })
         const buffer = Buffer.from(response.data.result.image, 'base64')
         conn.sendSticker(m.chat, buffer, m, {
            packname: setting.sk_pack,
            author: setting.sk_author
         })
      } catch (e) {
         throw Func.jsonFormat(e)
      }
   },
   limit: true
}