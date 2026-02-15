const { ProfileGenerator } = require('@kiznavierr/luna')

module.exports = {
   help: ['profilegi'],
   use: 'uid',
   tags: 'internet',
   run: async (m, {
      conn,
      usedPrefix,
      command,
      text,
      Func
   }) => {
      try {
         if (!text) throw Func.example(usedPrefix, command, '856012067')
         conn.sendReact(m.chat, '🕒', m.key)
         const generator = new ProfileGenerator()
         const result = await generator.generateProfile(text, {
            outputFormat: 'buffer'
         })
         if (!result.buffer) throw 'Failed to generate profile image.'
         await conn.sendFile(m.chat, result.buffer, 'profile.png', 'Success', m)
      } catch (e) {
         console.error(e)
         throw Func.jsonFormat(e)
      }
   }
}