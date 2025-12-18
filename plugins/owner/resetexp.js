module.exports = {
  help: ['resetexp'],
  tags: 'owner',
  run: async (m, { conn, text, Func }) => {
    // Safety: require explicit confirmation
    // Usage: resetexp confirm  OR first run shows warning, then reply `resetexp yes`
    const arg = (text || '').trim().toLowerCase()
    if (!arg) {
      return conn.reply(m.chat, Func.texted('bold', `*R E S E T - E X P*\n\nKonfirmasi diperlukan\nPerintah ini akan mengatur EXP, level, dan role semua pengguna menjadi *0*, *0*, dan *Warrior V*.\nKetik:\nresetexp yes untuk mengonfirmasi sekarang`), m)
    }

    if (arg !== 'confirm' && arg !== 'yes') return conn.reply(m.chat, Func.texted('bold', '❌ Dibatalkan. Untuk melanjutkan, gunakan `resetexp confirm`'), m)

    // Perform reset
    try {
      let dbPath = Func.resolvePath ? Func.resolvePath('data.json') : './data.json'
      let db = global.db
      if (!db || !db.users) {
        return conn.reply(m.chat, Func.texted('bold', 'Database pengguna tidak ditemukan atau belum dimuat.'), m)
      }
      let total = 0
      Object.keys(db.users).forEach(k => {
        if (!db.users[k]) return
        db.users[k].exp = 0
        db.users[k].level = 0
        db.users[k].role = 'Warrior V'
        total++
      })
      // Persist to disk: if Func.saveDB or Func.writeJSON exists try to use it
      if (Func && Func.writeJson) {
        await Func.writeJson('data.json', db)
      } else if (Func && Func.saveDB) {
        await Func.saveDB()
      } else {
        // best-effort write
        const fs = require('fs')
        try {
          fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
        } catch (e) {
          console.error('resetexp: failed to write data.json', e)
        }
      }

      conn.reply(m.chat, Func.texted('bold', `*R E S E T - E X P*\n\nSelesai. EXP, level, dan role telah direset untuk *${total}* pengguna.`), m)
    } catch (err) {
      console.error('resetexp error', err)
      conn.reply(m.chat, Func.texted('bold', '❌ Terjadi kesalahan saat mereset EXP. Lihat console untuk detail.'), m)
    }
  },
  owner: true
}
