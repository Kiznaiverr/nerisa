const os = require('os')

module.exports = {
   help: ['ping'],
   tags: 'miscs',
   run: async (m, {
      conn,
      Func
   }) => {
      try {
         const start = Date.now()
         const sentMsg = await conn.reply(m.chat, 'Testing Speed . . .', m)
         const latency = Date.now() - start

         const memoryUsage = process.memoryUsage()
         const uptime = Func.toTime(os.uptime())
         const totalMem = await Func.getSize(os.totalmem())
         const freeMem = await Func.getSize(os.freemem())
         const usedMem = await Func.getSize(memoryUsage.heapUsed)

         const reply = `*乂 PING STATS*\n\n` +
            `◦ *Latency*: ${latency}ms\n` +
            `◦ *Uptime*: ${uptime}\n` +
            `◦ *Memory Used*: ${usedMem}\n` +
            `◦ *Total Memory*: ${totalMem}\n` +
            `◦ *Free Memory*: ${freeMem}\n` +
            `◦ *Node Version*: ${process.version}\n` +
            `◦ *Platform*: ${os.platform()}`

         await conn.sendMessage(m.chat, {
            text: reply,
            edit: sentMsg.key
         })
      } catch (e) {
         throw Func.jsonFormat(e)
      }
   },
   error: false
}