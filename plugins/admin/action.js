module.exports = {
   help: ['add', 'promote', 'demote', 'kick', 'warn', 'unwarn'],
   use: 'mention or reply',
   tags: 'admin',
   run: async (m, {
      conn,
      usedPrefix,
      command,
      text,
      participants,
      Func
   }) => {
      let input = m?.mentionedJid?.[0] || m?.quoted?.sender || text
      if (!input) return conn.reply(m.chat, Func.texted('bold', `🚩 Mention or reply chat target.`), m)

      let jid = input
      if (input.includes('@lid')) {
         const p = participants.find(p => p.lid === input)
         if (!p) return conn.reply(m.chat, Func.texted('bold', `🚩 Cannot find user in group.`), m)
         jid = p.id
      } else if (!input.includes('@s.whatsapp.net')) {
         const wa = await conn.onWhatsApp(input.trim())
         if (!wa.length) return conn.reply(m.chat, Func.texted('bold', `🚩 Invalid number.`), m)
         jid = conn.decodeJid(wa[0].jid)
      }

      const number = jid.split('@')[0]
      const member = participants.find(p => p.id === jid)

      if (command === 'kick') {
         if (!member) return conn.reply(m.chat, Func.texted('bold', `🚩 @${number} already left or does not exist in this group.`), m)
         if (jid === conn.user.id) return conn.reply(m.chat, Func.texted('bold', `🚩 Cannot kick the bot itself.`), m)
         await conn.groupParticipantsUpdate(m.chat, [jid], 'remove')
         return m.reply(Func.jsonFormat({ status: 'removed', jid }))
      }
      if (command === 'add') {
         if (member) return conn.reply(m.chat, Func.texted('bold', `🚩 @${number} already in this group.`), m)
         await conn.groupParticipantsUpdate(m.chat, [jid], 'add')
         return m.reply(Func.jsonFormat({ status: 'added', jid }))
      }
      if (command === 'demote') {
         if (!member) return conn.reply(m.chat, Func.texted('bold', `🚩 @${number} already left or does not exist in this group.`), m)
         if (jid === conn.user.id) return conn.reply(m.chat, Func.texted('bold', `🚩 Cannot demote their own bots.`), m)
         await conn.groupParticipantsUpdate(m.chat, [jid], 'demote')
         return m.reply(Func.jsonFormat({ status: 'demoted', jid }))
      }
      if (command === 'promote') {
         if (!member) return conn.reply(m.chat, Func.texted('bold', `🚩 @${number} already left or does not exist in this group.`), m)
         if (jid === conn.user.id) return conn.reply(m.chat, Func.texted('bold', `🚩 Cannot promote their own bots.`), m)
         await conn.groupParticipantsUpdate(m.chat, [jid], 'promote')
         return m.reply(Func.jsonFormat({ status: 'promoted', jid }))
      }
      if (command === 'warn') {
         if (!member) return conn.reply(m.chat, Func.texted('bold', `🚩 @${number} already left or does not exist in this group.`), m)
         if (jid === conn.user.id) return conn.reply(m.chat, Func.texted('bold', `🚩 Cannot warn the bot itself.`), m)
         let groupSet = global.db.groups[m.chat]
         if (!groupSet.member[jid]) {
            groupSet.member[jid] = {
               warning: 0,
               chat: 1,
               lastseen: new Date() * 1
            }
         }
         groupSet.member[jid].warning += 1
         let warning = groupSet.member[jid].warning
         if (warning > 4) {
            await conn.groupParticipantsUpdate(m.chat, [jid], 'remove')
            groupSet.member[jid].warning = 0
            return conn.reply(m.chat, Func.texted('bold', `🚩 @${number} has been kicked (5/5 warnings).`), m)
         }
         return conn.reply(m.chat, Func.texted('bold', `⚠️ @${number} warned [${warning}/5]`), m)
      }
      if (command === 'unwarn') {
         if (!member) return conn.reply(m.chat, Func.texted('bold', `🚩 @${number} already left or does not exist in this group.`), m)
         if (jid === conn.user.id) return conn.reply(m.chat, Func.texted('bold', `🚩 Cannot unwarn the bot itself.`), m)
         let groupSet = global.db.groups[m.chat]
         if (!groupSet.member[jid] || groupSet.member[jid].warning <= 0) return conn.reply(m.chat, Func.texted('bold', `🚩 @${number} has no warnings to remove.`), m)
         groupSet.member[jid].warning -= 1
         let warning = groupSet.member[jid].warning
         return conn.reply(m.chat, Func.texted('bold', `✅ @${number} unwarned [${warning}/5]`), m)
      }
   },
   group: true,
   admin: true,
   botAdmin: true,
  ownerBypass: true
}