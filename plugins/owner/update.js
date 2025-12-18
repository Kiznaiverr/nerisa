const { execSync } = require('child_process')

module.exports = {
   help: ['update'],
   tags: 'owner',
   run: async (m, {
      conn,
      usedPrefix,
      command,
      Func
   }) => {
      try {
         // Discard local changes to specific files before pulling
         try {
            execSync('git checkout -- .env config.json main.js')
         } catch (discardError) {
            // Ignore if files don't exist or no changes
         }

         var stdout = execSync('git pull')
         var output = stdout.toString()

         if (output.match(new RegExp('Already up to date', 'g'))) return conn.reply(m.chat, Func.texted('bold', `🚩 ${output.trim()}`), m)
         return conn.reply(m.chat, `🚩 ${output.trim()}`, m).then(async () => process.send('reset'))
      } catch (e) {
         return conn.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   owner: true,
   error: false
}