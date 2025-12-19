const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

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
         // Backup .env to exclude from overwrite
         const envPath = path.join(process.cwd(), '.env')
         const envBackup = path.join(process.cwd(), '.env.backup')
         if (fs.existsSync(envPath)) {
            fs.copyFileSync(envPath, envBackup)
         }

         // Force overwrite local changes with remote (except .env)
         execSync('git fetch origin')
         execSync('git reset --hard origin/master')

         // Restore .env from backup
         if (fs.existsSync(envBackup)) {
            fs.copyFileSync(envBackup, envPath)
            fs.unlinkSync(envBackup) // Clean up backup
         }

         var stdout = execSync('git pull')
         var output = stdout.toString()

         if (output.match(new RegExp('Already up to date', 'g'))) {
            const status = execSync('git status --porcelain').toString().trim()
            const changes = status ? `Files changed:\n${status}` : 'No local changes.'
            return conn.reply(m.chat, Func.texted('bold', `🚩 ${output.trim()}\n\n${changes}`), m)
         }
         return conn.reply(m.chat, `🚩 ${output.trim()}`, m).then(async () => process.send('reset'))
      } catch (e) {
         return conn.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   owner: true,
   error: false
}