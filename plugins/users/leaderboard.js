const fs = require('fs')

module.exports = {
   help: ['leaderboard'],
   aliases: ['lb'],
   use: '',
   tags: 'users',
   run: async (m, { conn, Func }) => {
      let users = Object.entries(global.db.users).map(([id, data]) => ({
         id,
         ...data
      })).filter(v => v.exp > 0).sort((a, b) => b.exp - a.exp).slice(0, 10)

      let teks = '🏆 *LEADERBOARD TOP 10*\n\n'
      users.forEach((user, i) => {
         let name = user.name || 'Unknown'
         teks += `${i + 1}. *${name}*, Level ${user.level || 0}, Exp ${Func.formatNumber(user.exp || 0)}\n\n`
      })

      await conn.sendMessageModify(m.chat, teks, m, {
         thumbnail: fs.readFileSync('./lib/assets/images/leaderboard.jpg'),
         largeThumb: true
      })
   },
   group: true,
   error: false
}
