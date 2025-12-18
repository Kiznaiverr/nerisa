const Levelling = require('../../lib/system/levelling');

module.exports = {
   help: ['levelup'],
   tags: 'users',
   run: async (m, {
      conn,
      Func,
      users
   }) => {
      // Check and initialize fields if not exist
      if (typeof users.level === 'undefined') {
         users.level = 0;
         users.role = 'Warrior V';
      }

      const levelling = new Levelling();
      let currentLevel = users.level;
      let currentExp = users.exp;
      let levelsGained = 0;

      // Loop to level up as much as possible
      while (true) {
         let nextLevel = currentLevel + 1;
         let xpNeeded = levelling.xpRange(nextLevel).min - currentExp;
         if (xpNeeded > 0) break; // Not enough exp
         currentLevel = nextLevel;
         levelsGained++;
      }

      const pic = await conn.profilePictureUrl(m.sender, 'image').catch(() => Func.fetchBuffer('./lib/assets/images/default.jpg'))

      if (levelsGained > 0) {
         // Level up
         users.level = currentLevel;
         users.role = Func.role(currentLevel).name;
         let nextLevelExp = levelling.xpRange(currentLevel + 1).min;
         let caption = `乂  *L E V E L U P*\n\n`;
         caption += `   ◦  *Congratulations!* You leveled up ${levelsGained} level(s) to ${currentLevel}\n`;
         caption += `   ◦  *Role* : ${users.role}\n`;
         caption += `   ◦  *Current Exp* : ${Func.formatNumber(currentExp)}\n`;
         caption += `   ◦  *Exp needed for next level* : ${Func.formatNumber(nextLevelExp - currentExp)}\n\n`;
         caption += global.footer;
         await conn.sendMessageModify(m.chat, caption, m, {
            largeThumb: true,
            thumbnail: pic
         });
      } else {
         // Not enough exp
         let nextLevel = currentLevel + 1;
         let xpNeeded = levelling.xpRange(nextLevel).min - currentExp;
         let nextLevelExp = levelling.xpRange(nextLevel).min;
         let caption = `乂  *L E V E L - I N F O*\n\n`;
         caption += `   ◦  *Current level* : ${currentLevel}\n`;
         caption += `   ◦  *Need* ${Func.formatNumber(xpNeeded)} *exp more to level up to* ${nextLevel}\n`;
         caption += `   ◦  *Current Exp* : ${Func.formatNumber(currentExp)}\n`;
         caption += `   ◦  *Total exp needed for level* ${nextLevel} : ${Func.formatNumber(nextLevelExp)}\n\n`;
         caption += global.footer;
         await conn.sendMessageModify(m.chat, caption, m, {
            largeThumb: true,
            thumbnail: pic
         });
      }
   },
   limit: true,
   register: true
};