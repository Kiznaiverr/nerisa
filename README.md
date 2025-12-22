# NERISA BOT - WhatsApp Unofficial Bot (Baileys)

> Nerisa is an unofficial WhatsApp bot built with Baileys library. Forked from [Moon Bot](https://github.com/znanx/moon-bot) with additional features and performance improvements.
>
> This bot connects to WhatsApp Web and allows you to send/receive messages, manage groups, share media, and automate various tasks.

## Requirements

- Server vCPU/RAM 1/1GB (Minimum)
- NodeJS v20 or higher
- FFmpeg
- WhatsApp account
- API Key [Alyachan API](https://api.alyachan.dev/) 

## Recommended Server

- [Heroku](https://heroku.com/) - Free tier (limited)
- [DigitalOcean](https://digitalocean.com/) - Paid VPS
- [HostData](https://hostdata.id/) - VPS NAT (recommended)
- [Railway](https://railway.app) - PostgreSQL/MongoDB
- Local VPS/RDP

## Database

Choose one:

- [MongoDB](https://mongodb.com) - NoSQL (Recommended)
- [Supabase](https://supabase.com) - PostgreSQL
- [Railway](https://railway.app) - PostgreSQL/MongoDB
- LocalDB - JSON file storage (Default)

## Configuration

There are several configuration files:

### .env

```env
# Timezone
TZ = 'Asia/Jakarta'

# Database URI (Leave empty for LocalDB)
DATABASE_URL = ''

# API Configuration
API_ENDPOINT = 'https://api.alyachan.dev/api'
API_KEY = 'your-api-key'
```

### config.json

```json
{
  "owner": "6285179886349",
  "owner_name": "Contact Support",
  "database": "data",
  "limit": "10",
  "multiplier": "250",
  "min_reward": 100000,
  "max_reward": 500000,
  "ram_limit": "1GB",
  "max_upload": 100,
  "max_upload_free": 50,
  "timer": 180000,
  "timeout": 1800000,
  "spam": {
    "mode": "command",
    "limit": 5,
    "time_window": 5,
    "time_ban": 30,
    "max_ban": 3,
    "cooldown": 5
  },
  "blocks": ["994", "221", "263", "212"],
  "pairing": {
    "state": true,
    "number": 628XXXXXXXXXX
  }
}
```

### lib/system/config.js

```javascript
global.creator = '@nerisa - kiznavierr'
global.Api = AlyaApi
global.header = `nerisa v${require('../../package.json').version}`
global.footer = Func.Styles('WhatsApp bot with advanced features')
```

## Installation

### Quick Start

```bash
npm install
node index.js
```

### Using PM2

```bash
npm i pm2 -g
npm install
pm2 start index.js --name "nerisa"
pm2 logs nerisa
```

### Docker (Optional)

```bash
docker build -t nerisa .
docker run -d --name nerisa nerisa
```

## Plugin Structure

### Command Plugin

```javascript
module.exports = {
  help: ['feature'],
  aliases: ['fitur'],
  tags: 'miscs',
  run: async (m, {
    conn,
    args,
    command,
    Func
  }) => {
    conn.reply(m.chat, Func.texted('bold', 'Hello World!'), m)
  },
  admin: false,
  group: false,
  botAdmin: false,
  error: false
}
```

### Event Plugin

```javascript
module.exports = {
  run: async (m, {
    conn,
    body,
    isAdmin,
    isBotAdmin,
    groupSet
  }) => {
    if (groupSet.antilink && !isAdmin && body) {
      // Handle antilink
    }
  },
  group: true,
  error: false
}
```

### Handler Context

**Command:**
```javascript
plugin.run(m, { 
  ctx, conn, store, body, usedPrefix, plugins, commands, args, 
  command, text, prefixes, isCommand, database, env, groupSet, 
  chats, users, setting, isOwner, isPrem, groupMetadata, 
  participants, isAdmin, isBotAdmin, Func, Scraper 
})
```

**Event:**
```javascript
event.run(m, { 
  ctx, conn, store, body, plugins, prefixes, isCommand, database, 
  env, groupSet, chats, users, setting, isOwner, isPrem, 
  groupMetadata, participants, isAdmin, isBotAdmin, Func, Scraper 
})
```

## Sending Messages

```javascript
// Plain text
conn.reply(jid, 'Hello World!', quoted)

// Contact card
conn.sendContact(jid, [{
  name: 'John Doe',
  number: '6281xxx',
  about: 'Owner & Creator'
}], quoted)

// Media with thumbnail
conn.sendMessageModify(jid, 'Look at this!', quoted, {
  largeThumb: true,
  thumbnail: 'https://i.ibb.co/xxx/image.jpg'
})

// File/Media
conn.sendFile(jid, 'https://i.ibb.co/xxx/image.jpg', 'image.jpg', 'Caption', quoted)
```

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) file for details.

## Credits

- Original Creator: [Moon Bot - znanx](https://github.com/znanx/moon-bot)
- Fork & Enhancement: [Nerisa - Kiznaiverr](https://github.com/Kiznaiverr/nerisa)
- Library: [Baileys](https://github.com/WhiskeySockets/Baileys)

## Disclaimer

This is an unofficial WhatsApp bot. Use of this bot is entirely your responsibility. We are not responsible for:
- Your WhatsApp account being banned/suspended
- Loss of data or personal information
- Illegal activities using this bot

Use wisely and ethically!

## Report Issues

- [GitHub Issues](https://github.com/Kiznaiverr/nerisa/issues) - Report bugs or request features

---

This project is still in development and will continue to be updated. Don't forget to give a star and fork this repository!
