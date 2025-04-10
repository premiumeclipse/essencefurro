"""
essence Discord Bot with Dashboard Integration

This Discord bot is designed to work with the essence dashboard and supports:
1. Cog-based structure for modular commands
2. WebSocket connection to the dashboard for real-time updates
3. Command handling with prefix-based commands
4. Event handling for various Discord events

Requirements:
- Python 3.8+
- discord.py
- websockets
- aiohttp
"""

import os
import sys
import json
import logging
import asyncio
import datetime
import traceback
from typing import Dict, List, Any, Optional, Union

import discord
from discord.ext import commands, tasks

import websockets
from websockets.exceptions import ConnectionClosedError, ConnectionClosedOK

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("bot.log", encoding="utf-8")
    ]
)
logger = logging.getLogger("essence")

# Bot configuration
PREFIX = ">"  # Default command prefix
TOKEN = os.getenv("DISCORD_TOKEN")  # Get token from environment
DASHBOARD_URL = os.getenv("DASHBOARD_URL", "ws://localhost:5000/ws")  # WebSocket URL
DASHBOARD_SECRET = os.getenv("DASHBOARD_SECRET", "essence_dashboard_secret")  # Auth secret

# Bot initialization with intents
intents = discord.Intents.default()
intents.members = True  # Required for member tracking
intents.message_content = True  # Required for command processing
intents.guilds = True  # Required for server tracking

class EssenceBot(commands.Bot):
    def __init__(self):
        super().__init__(
            command_prefix=self.get_prefix,
            intents=intents,
            case_insensitive=True,
            help_command=None  # We'll define our own help command
        )
        
        # Bot state
        self.start_time = datetime.datetime.now()
        self.ws_connected = False
        self.ws = None
        self.prefix_cache = {}  # Guild ID -> prefix
        self.command_counter = 0
        self.message_counter = 0
        
        # Bot configuration
        self.dashboard_url = DASHBOARD_URL
        self.dashboard_secret = DASHBOARD_SECRET
        
        # Register tasks
        self.heartbeat_task.start()
        self.update_stats_task.start()
        
    async def get_prefix(self, message):
        """Get the command prefix for a guild"""
        # Use default prefix in DMs
        if not message.guild:
            return PREFIX
            
        # Check cache first
        if message.guild.id in self.prefix_cache:
            return self.prefix_cache[message.guild.id]
            
        # Default prefix if not found
        return PREFIX

    async def setup_hook(self):
        """Setup hook that runs before the bot starts"""
        # Connect to dashboard
        self.bot_loop = asyncio.create_task(self.dashboard_connection_loop())
        
        # Load all cogs
        await self.load_extensions()
        
        logger.info(f"Bot setup complete. Logged in as {self.user} (ID: {self.user.id})")
        logger.info(f"Connected to {len(self.guilds)} guilds with {sum(g.member_count for g in self.guilds)} users")
    
    async def load_extensions(self):
        """Load all cogs from the cogs directory"""
        loaded = 0
        failed = 0
        
        logger.info("Loading extensions...")
        
        for filename in os.listdir("./cogs"):
            if filename.endswith(".py") and not filename.startswith("_"):
                try:
                    await self.load_extension(f"cogs.{filename[:-3]}")
                    loaded += 1
                    logger.info(f"Loaded extension: {filename[:-3]}")
                except Exception as e:
                    failed += 1
                    logger.error(f"Failed to load extension {filename[:-3]}: {e}")
                    traceback.print_exc()
        
        logger.info(f"Extension loading complete. Loaded: {loaded}, Failed: {failed}")
    
    async def dashboard_connection_loop(self):
        """Main loop to maintain a connection to the dashboard"""
        while not self.is_closed():
            try:
                # Connect to the WebSocket
                async with websockets.connect(self.dashboard_url) as ws:
                    self.ws = ws
                    self.ws_connected = True
                    logger.info(f"Connected to dashboard at {self.dashboard_url}")
                    
                    # Authentication message
                    auth_message = {
                        "type": "bot_auth",
                        "token": self.dashboard_secret
                    }
                    await ws.send(json.dumps(auth_message))
                    
                    # Send initial state
                    await self.send_bot_stats()
                    
                    # Main message processing loop
                    while True:
                        message = await ws.recv()
                        await self.process_dashboard_message(message)
                        
            except (ConnectionClosedError, ConnectionClosedOK) as e:
                self.ws_connected = False
                self.ws = None
                logger.warning(f"Dashboard connection closed: {e}. Reconnecting in 5 seconds...")
                await asyncio.sleep(5)
            except Exception as e:
                self.ws_connected = False
                self.ws = None
                logger.error(f"Dashboard connection error: {e}")
                logger.error(traceback.format_exc())
                await asyncio.sleep(10)
    
    async def process_dashboard_message(self, message: str):
        """Process messages from the dashboard"""
        try:
            data = json.loads(message)
            message_type = data.get("type")
            
            if message_type == "ping":
                await self.send_dashboard_message({"type": "pong"})
            
            elif message_type == "command":
                # Execute a command from the dashboard
                await self.process_dashboard_command(data)
            
            elif message_type == "update_settings":
                # Update bot settings
                await self.update_bot_settings(data)
            
            else:
                logger.warning(f"Unknown dashboard message type: {message_type}")
                
        except json.JSONDecodeError:
            logger.error(f"Failed to parse dashboard message: {message}")
        except Exception as e:
            logger.error(f"Error processing dashboard message: {e}")
            logger.error(traceback.format_exc())
    
    async def process_dashboard_command(self, data: Dict[str, Any]):
        """Process a command sent from the dashboard"""
        command_name = data.get("command")
        guild_id = data.get("guild_id")
        channel_id = data.get("channel_id")
        args = data.get("args", [])
        
        if not all([command_name, guild_id, channel_id]):
            logger.error(f"Invalid dashboard command data: {data}")
            return
        
        try:
            # Find the guild and channel
            guild = self.get_guild(int(guild_id))
            if not guild:
                logger.error(f"Guild not found: {guild_id}")
                return
                
            channel = guild.get_channel(int(channel_id))
            if not channel:
                logger.error(f"Channel not found: {channel_id}")
                return
            
            # Get the command
            command = self.get_command(command_name)
            if not command:
                logger.error(f"Command not found: {command_name}")
                return
            
            # Create a mock context
            ctx = await self.get_context(
                DashboardMessage(
                    bot=self,
                    guild=guild,
                    channel=channel,
                    author=guild.me,
                    content=f"{self.command_prefix}{command_name} {' '.join(args)}",
                    args=args
                )
            )
            
            # Execute the command
            await ctx.command.invoke(ctx)
            
            # Send response back to dashboard
            await self.send_dashboard_message({
                "type": "command_response",
                "command": command_name,
                "guild_id": guild_id,
                "success": True,
                "message": "Command executed successfully"
            })
            
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Error executing dashboard command {command_name}: {e}")
            logger.error(traceback.format_exc())
            
            # Send error back to dashboard
            await self.send_dashboard_message({
                "type": "command_response",
                "command": command_name,
                "guild_id": guild_id,
                "success": False,
                "message": error_msg
            })
    
    async def update_bot_settings(self, data: Dict[str, Any]):
        """Update bot settings from dashboard"""
        settings_type = data.get("settings_type")
        guild_id = data.get("guild_id")
        settings = data.get("settings", {})
        
        if not all([settings_type, guild_id]):
            logger.error(f"Invalid settings update: {data}")
            return
        
        try:
            guild = self.get_guild(int(guild_id))
            if not guild:
                logger.error(f"Guild not found: {guild_id}")
                return
            
            # Update prefix
            if settings_type == "prefix" and "prefix" in settings:
                new_prefix = settings["prefix"]
                # In a real implementation, save this to your database
                self.prefix_cache[guild.id] = new_prefix
                logger.info(f"Updated prefix for {guild.name} to {new_prefix}")
            
            # Other setting types would be handled here
            
            # Send response back to dashboard
            await self.send_dashboard_message({
                "type": "settings_update_response",
                "settings_type": settings_type,
                "guild_id": guild_id,
                "success": True
            })
            
        except Exception as e:
            logger.error(f"Error updating settings: {e}")
            logger.error(traceback.format_exc())
            
            # Send error back to dashboard
            await self.send_dashboard_message({
                "type": "settings_update_response",
                "settings_type": settings_type,
                "guild_id": guild_id,
                "success": False,
                "message": str(e)
            })
    
    async def send_dashboard_message(self, data: Dict[str, Any]):
        """Send a message to the dashboard"""
        if not self.ws_connected or not self.ws:
            logger.warning("Cannot send dashboard message: not connected")
            return
        
        try:
            await self.ws.send(json.dumps(data))
        except Exception as e:
            logger.error(f"Error sending dashboard message: {e}")
            self.ws_connected = False
    
    async def send_bot_stats(self):
        """Send bot stats to the dashboard"""
        if not self.ws_connected:
            return
            
        uptime = (datetime.datetime.now() - self.start_time).total_seconds()
        guild_count = len(self.guilds)
        user_count = sum(g.member_count for g in self.guilds)
        
        stats = {
            "type": "bot_stats",
            "stats": {
                "uptime": int(uptime),
                "guilds": guild_count,
                "users": user_count,
                "commands_run": self.command_counter,
                "message_count": self.message_counter,
                "is_online": True
            }
        }
        
        await self.send_dashboard_message(stats)
    
    @tasks.loop(seconds=30)
    async def heartbeat_task(self):
        """Send heartbeat to dashboard"""
        if self.ws_connected:
            await self.send_dashboard_message({"type": "heartbeat"})
    
    @tasks.loop(minutes=5)
    async def update_stats_task(self):
        """Update stats to dashboard periodically"""
        await self.send_bot_stats()
    
    @heartbeat_task.before_loop
    @update_stats_task.before_loop
    async def before_task(self):
        """Wait until bot is ready before starting tasks"""
        await self.wait_until_ready()
    
    async def on_ready(self):
        """Called when the bot is ready"""
        logger.info(f"Bot is ready! Logged in as {self.user} (ID: {self.user.id})")
        
        # Set activity to show help command
        activity = discord.Activity(
            type=discord.ActivityType.listening,
            name=f"{PREFIX}help | essencedsc.netlify.app"
        )
        await self.change_presence(activity=activity)
    
    async def on_message(self, message):
        """Called when a message is received"""
        # Don't respond to bots
        if message.author.bot:
            return
            
        # Increment message counter
        self.message_counter += 1
        
        # Process commands
        await self.process_commands(message)
    
    async def on_command(self, ctx):
        """Called when a command is about to be executed"""
        logger.info(f"Command {ctx.command.name} executed by {ctx.author} in {ctx.guild}")
    
    async def on_command_completion(self, ctx):
        """Called when a command is successfully executed"""
        self.command_counter += 1
    
    async def on_guild_join(self, guild):
        """Called when the bot joins a guild"""
        logger.info(f"Joined guild: {guild.name} (ID: {guild.id})")
        
        # Update dashboard with new stats
        await self.send_bot_stats()
    
    async def on_guild_remove(self, guild):
        """Called when the bot is removed from a guild"""
        logger.info(f"Left guild: {guild.name} (ID: {guild.id})")
        
        # Update dashboard with new stats
        await self.send_bot_stats()


class DashboardMessage:
    """A mock message class for dashboard commands"""
    def __init__(self, bot, guild, channel, author, content, args=None):
        self.bot = bot
        self.guild = guild
        self.channel = channel
        self.author = author
        self.content = content
        self.args = args or []
        self.id = 0
        self.attachments = []
        self.clean_content = content
        self.created_at = datetime.datetime.now()
        self.embeds = []
        self.mentions = []
        self.mention_everyone = False
        self.channel_mentions = []
        self.role_mentions = []
        
    async def add_reaction(self, emoji):
        pass
        
    async def reply(self, content=None, **kwargs):
        pass


async def main():
    """Main entry point for the bot"""
    # Check if token is provided
    if not TOKEN:
        logger.error("No Discord token provided. Set the DISCORD_TOKEN environment variable.")
        return
    
    # Create the bot instance
    bot = EssenceBot()
    
    # Run the bot
    try:
        logger.info("Starting bot...")
        await bot.start(TOKEN)
    except discord.LoginFailure:
        logger.error("Invalid token provided")
    except Exception as e:
        logger.error(f"Error starting bot: {e}")
        logger.error(traceback.format_exc())
    finally:
        if not bot.is_closed():
            await bot.close()


if __name__ == "__main__":
    # Create necessary directories
    os.makedirs("cogs", exist_ok=True)
    os.makedirs("logs", exist_ok=True)
    
    # Run the bot
    asyncio.run(main())