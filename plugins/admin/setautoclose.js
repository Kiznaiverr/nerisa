/**
 * @fileoverview Auto Group Close/Open Scheduler
 * @description Set automatic group close and open time based on configured schedule
 * @example
 * .setautoclose 14:30-15:00   -> Set autoclose schedule
 * .setautoclose off           -> Disable autoclose
 * .setautoclose              -> Show current status
 */

module.exports = {
   help: ['setautoclose'],
   use: 'HH:mm-HH:mm or off',
   tags: 'admin',
   run: async (m, {
      conn,
      args,
      groupSet,
      Func
   }) => {
      try {
         // Initialize autoclose if not exists
         if (!groupSet.autoclose) {
            groupSet.autoclose = {
               active: false,
               start: null,
               end: null,
               isClosed: false
            }
         }

         // Show current status if no arguments
         if (!args || !args[0]) {
            const status = groupSet.autoclose?.active ? '*ACTIVE*' : '*INACTIVE*'
            return conn.reply(m.chat, Func.texted('bold', `🚩 Auto Close Status : ${status}`), m)
         }

         // Disable autoclose
         if (args[0].toLowerCase() === 'off') {
            groupSet.autoclose.active = false
            return conn.reply(m.chat, Func.texted('bold', `🚩 Auto close has been deactivated.`), m)
         }

         // Validate time format HH:mm-HH:mm
         const timePattern = /^([0-1][0-9]|2[0-3]):([0-5][0-9])-([0-1][0-9]|2[0-3]):([0-5][0-9])$/
         if (!timePattern.test(args[0])) {
            return conn.reply(m.chat, `🚩 *Invalid format!*\n\nUsage:\n   • ${Func.texted('code', '.setautoclose 14:30-15:00')}\n   • ${Func.texted('code', '.setautoclose off')}\n\n*Example* : Set group close from 14:30 to 15:00 (local timezone)`, m)
         }

         // Parse and validate time
         const [startTime, endTime] = args[0].split('-')
         const [startHour, startMin] = startTime.split(':').map(Number)
         const [endHour, endMin] = endTime.split(':').map(Number)

         // Convert to minutes for comparison
         const startTotalMin = startHour * 60 + startMin
         const endTotalMin = endHour * 60 + endMin

         // Validate start time is before end time
         if (startTotalMin >= endTotalMin) {
            return conn.reply(m.chat, `🚩 *Invalid time range!*\n\nStart time must be before end time.\n\n*Example* : ${Func.texted('code', '.setautoclose 14:30-15:00')}`, m)
         }

         // Set autoclose configuration
         groupSet.autoclose = {
            active: true,
            start: startTime,
            end: endTime,
            isClosed: false
         }

         conn.reply(m.chat, Func.texted('bold', `🚩 Auto close has been set.`), m)

      } catch (e) {
         return conn.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   admin: true,
   group: true,
   botAdmin: true,
   error: false
}
