# essence Discord Bot & Dashboard

A comprehensive Discord bot with a web dashboard for server management, moderation, and more.

## Features

- 🤖 **Discord Bot**: Prefix-based commands for moderation, fun, and utility
- 🌐 **Web Dashboard**: Manage your bot settings through an intuitive web interface
- 🛡️ **Auto-Moderation**: Automatic spam, invite, and inappropriate content filtering
- 🔨 **Moderation Tools**: Comprehensive tools for server management
- 🎮 **Fun Commands**: Engage your community with interactive commands

## Dashboard

The essence dashboard allows server admins to:

- Configure bot settings for each server
- Manage auto-moderation rules
- View moderation logs
- Create custom commands
- Monitor server stats

## Prerequisites

- Node.js 16+ (for the dashboard)
- Python 3.8+ (for the bot)
- PostgreSQL database

## Setup Instructions

### Dashboard Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure environment variables:
   ```
   cp .env.example .env
   ```
   Edit `.env` with your PostgreSQL connection details and Discord OAuth credentials

4. Setup the database:
   ```
   npm run db:push
   ```

5. Start the dashboard:
   ```
   npm run dev
   ```

### Bot Setup

1. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Configure environment variables:
   ```
   cp .env.example .env.bot
   ```
   Edit `.env.bot` with your Discord bot token and dashboard connection details

3. Start the bot:
   ```
   python bot.py
   ```

## Bot Commands

The bot includes several command categories:

### General Commands
- `>help` - Shows help information
- `>ping` - Check bot latency
- `>info` - Display bot information
- `>serverinfo` - Display server information
- `>invite` - Get bot invite link
- `>dashboard` - Get dashboard link

### Moderation Commands
- `>purge [amount] [user]` - Delete messages
- `>kick [user] [reason]` - Kick a user
- `>ban [user] [reason]` - Ban a user
- `>unban [user_id] [reason]` - Unban a user
- `>mute [user] [duration] [reason]` - Timeout a user
- `>unmute [user] [reason]` - Remove a timeout
- `>warn [user] [reason]` - Warn a user
- `>slowmode [seconds]` - Set channel slowmode
- `>role add/remove/list` - Manage roles

### Fun Commands
- `>uwu [text]` - UwU-ify text or send a random uwu message
- `>choose [options]` - Choose between options
- `>8ball [question]` - Ask the magic 8-ball
- `>roll [dice]` - Roll dice
- `>coin` - Flip a coin
- `>hug [user]` - Give someone a hug
- `>pat [user]` - Pat someone on the head
- `>avatar [user]` - Show a user's avatar

### AutoMod Commands
- `>automod enable/disable` - Enable/disable automod
- `>automod invites enable/disable` - Configure invite filtering
- `>automod log [channel]` - Set the log channel

## Adding New Features

### Adding Bot Commands

To add new commands, create a new file in the `cogs` directory or add to an existing cog:

```python
@commands.command(name="command_name")
async def command_name(self, ctx, *args):
    """Command description for help command"""
    # Command implementation
    await ctx.send("Response")
```

### Adding Dashboard Features

To add new dashboard features:

1. Define database models in `shared/schema.ts`
2. Create API endpoints in `server/routes.ts`
3. Add UI components in `client/src/pages/` or `client/src/components/`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Discord.js](https://discord.js.org/) - The API wrapper for Discord
- [discord.py](https://discordpy.readthedocs.io/) - Python API wrapper for Discord
- [React](https://reactjs.org/) - Frontend library
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - UI component library