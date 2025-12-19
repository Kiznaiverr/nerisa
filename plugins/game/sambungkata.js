const fs = require('fs')

// load and cache Indonesian word lists (kata.txt + kata-berulang.txt)
async function loadDict(Func) {
   if (global._sambungkata_dict && global._sambungkata_dict.length) return global._sambungkata_dict
   const DICT_URLS = [
      'https://raw.githubusercontent.com/agulagul/Indonesia-words/master/kata.txt',
      'https://raw.githubusercontent.com/agulagul/Indonesia-words/master/kata-berulang.txt'
   ]
   try {
      let words = []
      for (let url of DICT_URLS) {
         let buf = await Func.fetchBuffer(url).catch(() => null)
         if (!buf) continue
         let txt = buf.toString('utf8')
         txt.split(/\r?\n/).forEach(l => {
            let w = (l || '').trim().toLowerCase()
            if (!w) return
            if (!/^[a-z]+$/.test(w)) return
            words.push(w)
         })
      }
      if (!words.length) throw new Error('empty')
      let uniq = Array.from(new Set(words))
      global._sambungkata_dict = uniq
      return uniq
   } catch (e) {
      let fallback = ['cinta', 'tahu', 'rumah', 'mobil', 'makan', 'minum', 'jalan', 'lari', 'terbang', 'berenang', 'api', 'air', 'tanah', 'angin', 'matahari', 'bulan', 'bintang', 'awan', 'hujan', 'salju']
      global._sambungkata_dict = fallback
      return fallback
   }
}

module.exports = [{
   help: ['sambungkata'],
   aliases: ['skata'],
   tags: 'game',
   run: async (m, {
      conn,
      usedPrefix,
      command,
      text,
      env,
      Func
   }) => {
      conn.sambungkata = conn.sambungkata || {}
      let id = m.chat
      if ((command === 'sambungkata' || command === 'skata') && !text) {
         if (id in conn.sambungkata) return conn.reply(m.chat, 'Masih ada sesi sambungkata aktif di grup ini.', conn.sambungkata[id].msg)
         // load dictionary from GitHub (kata.txt + kata-berulang.txt) and fallback to builtin list
         // load dictionary and pick a start word
         let dict = await loadDict(Func)
         // choose a start word with length >= 3
         let candidates = dict.filter(w => w.length >= 3)
         let startWord = candidates[Math.floor(Math.random() * candidates.length)]
         let txt = `乂 *S A M B U N G K A T A*\n\nKata awal: *${startWord}*\n\nPembuat sesi otomatis join sebagai pemain pertama.\nJoin dengan *${usedPrefix}skata join*\nMax 10 pemain, auto start jika full.\nStart manual: *${usedPrefix}skata start*`
         // don't display the full session card yet; send a short confirmation and store that message as the session reference
         let confirmation = await conn.reply(m.chat, `✅ @${m.sender.split('@')[0]} membuat sesi dan otomatis join sebagai pemain pertama. Pemain: 1/10`, m)
         conn.sambungkata[id] = {
            msg: confirmation,
            creator: m.sender,
            players: [m.sender],
            currentWord: startWord,
            turn: 0,
            expGained: [0],
            usedWords: [startWord],
            started: false,
            lastPromptId: null,
            timer: null,
            mistakes: 0
         }
         // auto-cancel session if not started in 2 minutes
         conn.sambungkata[id].startTimeout = setTimeout(() => {
            if (conn.sambungkata[id] && !conn.sambungkata[id].started) {
               delete conn.sambungkata[id]
               conn.reply(m.chat, 'Sesi sambungkata dibatalkan karena tidak dimulai dalam 2 menit.', m)
            }
         }, 120000) // 2 menit
      } else if (text === 'join') {
         if (!(id in conn.sambungkata)) return conn.reply(m.chat, 'Tidak ada sesi sambungkata aktif.', m)
         let game = conn.sambungkata[id]
         if (game.started) return conn.reply(m.chat, 'Game sudah berjalan.', m)
         if (game.players.includes(m.sender)) return conn.reply(m.chat, 'Kamu sudah join.', m)
         if (game.players.length >= 10) return conn.reply(m.chat, 'Pemain sudah penuh.', m)
         game.players.push(m.sender)
         game.expGained.push(0)
         conn.reply(m.chat, `✅ @${m.sender.split('@')[0]} join sambungkata!\nPemain: ${game.players.length}/10`, m)
         if (game.players.length === 10) {
            if (!game.started) {
               conn.reply(m.chat, 'Pemain penuh, game dimulai!', m)
               startGame(conn, id, env, Func)
            }
         }
      } else if (text === 'leave') {
         if (!(id in conn.sambungkata)) return conn.reply(m.chat, 'Tidak ada sesi sambungkata aktif.', m)
         let game = conn.sambungkata[id]
         if (game.started) return conn.reply(m.chat, 'Tidak bisa leave, game sudah dimulai.', m)
         if (!game.players.includes(m.sender)) return conn.reply(m.chat, 'Kamu belum join.', m)
         // remove player and keep expGained aligned
         let idx = game.players.indexOf(m.sender)
         if (idx !== -1) {
            game.players.splice(idx, 1)
            game.expGained.splice(idx, 1)
         }
         conn.reply(m.chat, `❌ @${m.sender.split('@')[0]} keluar dari sesi. Pemain: ${game.players.length}/10`, m)
      } else if (text === 'players' || text === 'list') {
         if (!(id in conn.sambungkata)) return conn.reply(m.chat, 'Tidak ada sesi sambungkata aktif.', m)
         let game = conn.sambungkata[id]
         let list = game.players.map((p, i) => `${i + 1}. @${p.split('@')[0]}`).join('\n')
         conn.reply(m.chat, `📋 Pemain (${game.players.length}/10):\n${list}`, m)
      } else if (text === 'cancel') {
         if (!(id in conn.sambungkata)) return conn.reply(m.chat, 'Tidak ada sesi sambungkata aktif.', m)
         let game = conn.sambungkata[id]
         if (game.creator !== m.sender) return conn.reply(m.chat, 'Hanya pembuat sesi yang bisa membatalkan.', m)
         if (game.startTimeout) {
            clearTimeout(game.startTimeout)
            delete game.startTimeout
         }
         delete conn.sambungkata[id]
         conn.reply(m.chat, 'Sesi sambungkata dibatalkan.', m)
      } else if (text === 'stop') {
         if (!(id in conn.sambungkata)) return conn.reply(m.chat, 'Tidak ada sesi sambungkata aktif.', m)
         let game = conn.sambungkata[id]
         if (game.creator !== m.sender) return conn.reply(m.chat, 'Hanya pembuat sesi yang bisa menghentikan sesi.', m)
         if (game.timer) {
            clearTimeout(game.timer)
            delete game.timer
         }
         if (game.startTimeout) {
            clearTimeout(game.startTimeout)
            delete game.startTimeout
         }
         if (game.started) {
            conn.reply(m.chat, 'Sesi dihentikan oleh pembuat, game selesai.', m)
            return endGame(conn, id, Func)
         } else {
            delete conn.sambungkata[id]
            conn.reply(m.chat, 'Sesi dibatalkan oleh pembuat.', m)
         }
      } else if (text === 'start') {
         if (!(id in conn.sambungkata)) return conn.reply(m.chat, 'Tidak ada sesi sambungkata aktif.', m)
         let game = conn.sambungkata[id]
         if (game.players.length < 2) return conn.reply(m.chat, 'Minimal 2 pemain untuk start.', m)
         if (game.started) return conn.reply(m.chat, 'Game sudah berjalan.', m)
         startGame(conn, id, env, Func)
      }
   },
   limit: true,
   game: true,
   group: true,
   register: true
}, {
   run: async (m, {
      conn,
      users,
      env,
      Func
   }) => {
      let id = m.chat
      conn.sambungkata = conn.sambungkata || {}
      if (!(id in conn.sambungkata)) return
      let game = conn.sambungkata[id]
      // Only accept answers from players who have joined the session
      if (!game.players.includes(m.sender)) return
      // Accept answers from the current player. Quoting is optional.
      if (game.players[game.turn] !== m.sender) return conn.reply(m.chat, 'Bukan giliran kamu.', m)
      let answer = (m.text || '').trim().toLowerCase()
      if (!answer) return
      if (answer.length < 3) return conn.reply(m.chat, 'Jawaban minimal 3 huruf.', m)
      // expected prefix: last two letters if available, otherwise last letter
      let prefix = (game.currentWord && game.currentWord.length >= 2) ? game.currentWord.slice(-2).toLowerCase() : game.currentWord.slice(-1).toLowerCase()
      if (!answer.startsWith(prefix)) {
         // wrong answer
         clearTimeout(game.timer)
         game.mistakes += 1
         if (game.mistakes >= 3) {
            let penalty = Func.randomInt(env.min_reward, env.max_reward)
            let u = global.db.users[game.players[game.turn]]
            if (u) u.exp = Math.max(0, (u.exp || 0) - penalty)
            conn.reply(m.chat, `❌ Salah! Jawaban harus mulai dengan awalan '${prefix}'. @${game.players[game.turn].split('@')[0]} dikurangi ${Func.formatNumber(penalty)} EXP\nKesalahan 3/3, game selesai!`, m)
            return endGame(conn, id, Func)
         } else {
            conn.reply(m.chat, `❌ Salah! Jawaban harus mulai dengan awalan '${prefix}'.\nKesalahan ${game.mistakes}/3, coba lagi!`, m)
            return nextTurn(conn, id, env, Func)
         }
      }
      // duplicate word check
      if (game.usedWords && game.usedWords.includes(answer)) {
         clearTimeout(game.timer)
         game.mistakes += 1
         if (game.mistakes >= 3) {
            let penalty = Func.randomInt(env.min_reward, env.max_reward)
            let u = global.db.users[game.players[game.turn]]
            if (u) u.exp = Math.max(0, (u.exp || 0) - penalty)
            conn.reply(m.chat, `❌ Kata sudah pernah digunakan, @${game.players[game.turn].split('@')[0]} dikurangi ${Func.formatNumber(penalty)} EXP\nKesalahan 3/3, game selesai!`, m)
            return endGame(conn, id, Func)
         } else {
            conn.reply(m.chat, `❌ Kata sudah pernah digunakan.\nKesalahan ${game.mistakes}/3, coba lagi!`, m)
            return nextTurn(conn, id, env, Func)
         }
      }
      // validate against dictionary (reject non-dictionary words)
      let dict = global._sambungkata_dict || await loadDict(Func)
      if (!dict.includes(answer)) {
         clearTimeout(game.timer)
         game.mistakes += 1
         if (game.mistakes >= 3) {
            let penalty = Func.randomInt(env.min_reward, env.max_reward)
            let u = global.db.users[game.players[game.turn]]
            if (u) u.exp = Math.max(0, (u.exp || 0) - penalty)
            conn.reply(m.chat, `❌ Kata tidak valid menurut kamus, @${game.players[game.turn].split('@')[0]} dikurangi ${Func.formatNumber(penalty)} EXP\nKesalahan 3/3, game selesai!`, m)
            return endGame(conn, id, Func)
         } else {
            conn.reply(m.chat, `❌ Kata tidak valid menurut kamus.\nKesalahan ${game.mistakes}/3, coba lagi!`, m)
            return nextTurn(conn, id, env, Func)
         }
      }
      // correct answer
      clearTimeout(game.timer)
      let reward = Func.randomInt(env.min_reward, env.max_reward)
      // give exp to the answering user
      let answeringUser = global.db.users[m.sender]
      if (answeringUser) answeringUser.exp = (answeringUser.exp || 0) + reward
      // accumulate exp gained per player and defer level-up checks until game end to avoid spam
      game.expGained[game.turn] = (game.expGained[game.turn] || 0) + reward
      game.usedWords = game.usedWords || []
      game.usedWords.push(answer)
      game.currentWord = answer
      game.turn = (game.turn + 1) % game.players.length
      let sent = await conn.reply(m.chat, `✅ Benar! +${Func.formatNumber(reward)} EXP\nKata sekarang: *${answer}*\nGiliran: @${game.players[game.turn].split('@')[0]}`, m)
      game.lastPromptId = sent.id
      nextTurn(conn, id, env, Func)
   },
   game: true,
   group: true
}]

function startGame(conn, id, env, Func) {
   let game = conn.sambungkata[id]
   game.started = true
   if (game.startTimeout) {
      clearTimeout(game.startTimeout)
      delete game.startTimeout
   }
   // send the full session card now that the game is starting
   let startText = `乂 *S A M B U N G K A T A*\n\nKata awal: *${game.currentWord}*\n\nPembuat sesi otomatis join sebagai pemain pertama.\nPemain: ${game.players.length}/10\nGiliran pertama: @${game.players[0].split('@')[0]}\n\nMulai!`
   let sent = conn.reply(id, startText)
   // store last prompt id if reply returned it
   if (sent && sent.id) game.lastPromptId = sent.id
   nextTurn(conn, id, env, Func)
}

function nextTurn(conn, id, env, Func) {
   let game = conn.sambungkata[id]
   // clear old timer if any
   if (game.timer) clearTimeout(game.timer)
   // prompt next player
   let prefix = (game.currentWord && game.currentWord.length >= 2) ? game.currentWord.slice(-2).toLowerCase() : game.currentWord.slice(-1).toLowerCase()
   let prompt = `⏳ Giliran: @${game.players[game.turn].split('@')[0]}\nKata terakhir: *${game.currentWord}*\nKirim kata dengan awalan: *${prefix}*\nWaktu: 30 detik`
   let sent = conn.reply(id, prompt, conn.sambungkata[id].msg)
   if (sent && sent.id) game.lastPromptId = sent.id
   game.timer = setTimeout(() => {
      if (conn.sambungkata[id]) {
         game.mistakes += 1
         if (game.mistakes >= 3) {
            let penalty = Func.randomInt(env.min_reward, env.max_reward)
            let u = global.db.users[game.players[game.turn]]
            if (u) u.exp = Math.max(0, (u.exp || 0) - penalty)
            conn.reply(id, `⏰ Timeout! @${game.players[game.turn].split('@')[0]} gagal jawab.\n-${Func.formatNumber(penalty)} EXP\nKesalahan 3/3, game selesai!`, conn.sambungkata[id].msg)
            endGame(conn, id, Func)
         } else {
            conn.reply(id, `⏰ Timeout! @${game.players[game.turn].split('@')[0]} gagal jawab.\nKesalahan ${game.mistakes}/3, lanjut ke pemain berikutnya!`, conn.sambungkata[id].msg)
            nextTurn(conn, id, env, Func)
         }
      }
   }, 30000) // 30 detik
}

async function endGame(conn, id, Func) {
   let game = conn.sambungkata[id]
   if (!game) return
   try {
      if (game.timer) {
         clearTimeout(game.timer)
         delete game.timer
      }
      if (game.startTimeout) {
         clearTimeout(game.startTimeout)
         delete game.startTimeout
      }
      // build results and mentions safely
      let results = []
      for (let i = 0; i < (game.players || []).length; i++) {
         let gained = 0
         if (Array.isArray(game.expGained)) gained = Number(game.expGained[i] || 0)
         results.push({ jid: game.players[i], gained })
      }
      // send summary if any gains or to announce end
      let teks = '🏁 *Permainan selesai!*\n\nHasil sesi:'
      teks += '\n' + results.map((r, i) => `${i + 1}. @${r.jid.split('@')[0]} : ${r.gained > 0 ? `+${Func.formatNumber(r.gained)} EXP` : '0 EXP'}`).join('\n')
      try {
         await conn.reply(id, teks, { mentions: results.filter(r => r.gained > 0).map(r => r.jid) })
      } catch (e) {
         // ignore reply errors
         console.error('sambungkata: reply summary failed', e)
      }

      // small cooldown: wait a bit before running level-up checks to avoid interleaving messages
      await new Promise(resolve => setTimeout(resolve, 1500))
      for (let r of results) {
         if (r.gained > 0) {
            let user = global.db.users[r.jid]
            if (user && Func && Func.checkLevelUp) {
               let fakeMsg = {
                  key: { remoteJid: id, fromMe: false, id: 'sambungkata_' + r.jid + '_' + Date.now() },
                  message: { conversation: '' },
                  chat: id,
                  sender: r.jid,
                  participant: r.jid,
                  pushName: (global.db && global.db.users && global.db.users[r.jid] && global.db.users[r.jid].name) || ''
               }
               try {
                  await Func.checkLevelUp(user, conn, fakeMsg)
               } catch (e) {
                  console.error('sambungkata: checkLevelUp failed for', r.jid, e)
               }
               // brief pause between players to avoid spam
               await new Promise(resolve => setTimeout(resolve, 1000))
            }
         }
      }
   } catch (err) {
      console.error('sambungkata: endGame failed', err)
   } finally {
      // ensure session is removed even if errors happen
      try {
         delete conn.sambungkata[id]
      } catch (e) {}
   }
}