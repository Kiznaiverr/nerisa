module.exports = {
   help: ['owner'],
   aliases: ['creator'],
   tags: 'miscs',
   run: async (m, {
      conn,
      env
   }) => {
      conn.sendContact(m.chat, [{
         name: env.owner_name,
         number: env.owner,
         about: 'Owner & Creator'
      }], m, {
         org: 'nerisa Support',
         website: 'https://api.alyachan.dev',
         email: 'contact@nekoyama.my.id'
      })
   }
}