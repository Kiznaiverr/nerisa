const fs = require('fs')
const path = require('path')

module.exports = {
   help: ['allmenu'],
   aliases: ['allcmd', 'allcommand'],
   tags: 'main',
   run: async (m, {
      conn,
      usedPrefix,
      args,
      plugins,
      users,
      setting,
      env,
      Func
   }) => {
      let plugs = new Set(plugins.values())
      let category = {}
      for (let plugin of plugs) {
         let pluginFileName = path.parse(plugin.filePath).name
         if (setting.error?.includes(pluginFileName) || setting.pluginDisable?.includes(pluginFileName)) continue
         let tag = plugin.tags || 'misc'
         if (!category[tag]) category[tag] = []
         if (Array.isArray(plugin.help)) {
            for (let command of plugin.help) {
               category[tag].push({
                  command: command,
                  use: plugin.use || ''
               })
            }
         }
      }
      let sortedTags = Object.keys(category).sort()

      let pkg = require('../package.json')
      let local_size = fs.existsSync('./' + env.database + '.json') ? await Func.getSize(fs.statSync('./' + env.database + '.json').size) : ''
      let message = setting.msg
         .replace('+greeting', Func.greeting())
         .replace('+tag', `@${m.sender.replace(/@.+/g, '')}`)
         .replace('+db', (/mongo/.test(process.env.DATABASE_URL) ? 'MongoDB' : /postgre/.test(process.env.DATABASE_URL) ? 'PostgreSQL' : `Local : ${local_size}`))
         .replace('+library', pkg.dependencies['@whiskeysockets/baileys'].replace(/^\^|~|>|</g, ''))
         .replace('+version', pkg.version)

      let txt = `${message}\n\n`
      txt += `Total Commands: ${Object.values(category).flat().length}\n\n`

      for (let tag of sortedTags) {
         let formattedTag = tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase()
         txt += `乂  *${formattedTag}*\n\n`
         let cmd = category[tag].sort((a, b) => a.command.localeCompare(b.command))
         cmd.forEach((cmdObject, index) => {
            let box
            if (cmd.length === 1) box = '–'
            else if (index === 0) box = '┌'
            else if (index === cmd.length - 1) box = '└'
            else box = '│'
            let useText = cmdObject.use ? ` *${cmdObject.use}*` : ''
            txt += `${box}  ◦  ${usedPrefix}${cmdObject.command}${useText}\n`
         })
         txt += `\n`
      }
      txt += global.footer

      conn.sendMessageModify(m.chat, txt, m, {
         largeThumb: true,
         thumbnail: Func.isUrl(setting.cover) ? setting.cover : Buffer.from(setting.cover, 'base64'),
         url: setting.link
      })
   },
   limit: true
}