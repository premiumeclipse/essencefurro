"""
Example Python Discord Bot Integration with Dashboard WebSocket

This is a simple example showing how to connect a Discord.py bot to the
essence dashboard via WebSocket.

Requirements:
- Python 3.8+
- discord.py
- websockets

Install dependencies:
pip install discord.py websockets
"""

import asyncio
import json
import time
import logging
from typing import Dict, Any, Optional

import discord
from discord.ext import commands, tasks
import websockets

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('essence-bot')

# Bot configuration
TOKEN = "YOUR_DISCORD_BOT_TOKEN"  # Replace with your actual Discord bot token
DASHBOARD_WS_URL = "ws://localhost:5000/ws"  # Local development
# DASHBOARD_WS_URL = "wss://yourdomain.com/ws"  # Production URL
BOT_SECRET_TOKEN = "essence_bot_secret_token"  # Authentication token for dashboard

# Discord bot setup with intents
intents = discord.Intents.default()
intents.message_content = True
intents.members = True
intents.presences = True

bot = commands.Bot(command_prefix='>', intents=intents, help_command=None)

# Track bot stats
bot_stats = {
    "uptime": 0,
    "connectedServers": 0,
    "activeUsers": 0,
    "commandsProcessed": 0
}

# WebSocket connection
ws_connection: Optional[websockets.WebSocketClientProtocol] = None
start_time = time.time()
connected_to_dashboard = False

# Command to process map
command_processors = {}

# Connect to dashboard WebSocket
async def connect_to_dashboard():
    global ws_connection, connected_to_dashboard
    
    try:
        # Connect to the WebSocket server
        ws_connection = await websockets.connect(DASHBOARD_WS_URL)
        logger.info(f"Connected to dashboard WebSocket at {DASHBOARD_WS_URL}")
        
        # Authenticate with the dashboard
        auth_payload = {
            "type": "auth",
            "token": BOT_SECRET_TOKEN,
            "isBot": True
        }
        await ws_connection.send(json.dumps(auth_payload))
        
        # Wait for authentication response
        response = await ws_connection.recv()
        response_data = json.loads(response)
        
        if response_data.get("type") == "auth_error":
            logger.error(f"Authentication failed: {response_data.get('message')}")
            await ws_connection.close()
            ws_connection = None
            return False
        
        # Send initial bot stats
        await send_bot_stats()
        connected_to_dashboard = True
        return True
        
    except Exception as e:
        logger.error(f"Failed to connect to dashboard: {e}")
        if ws_connection:
            await ws_connection.close()
        ws_connection = None
        connected_to_dashboard = False
        return False

# Send heartbeat to dashboard
async def send_heartbeat():
    if ws_connection and connected_to_dashboard:
        try:
            uptime = int(time.time() - start_time)
            payload = {
                "type": "heartbeat",
                "uptime": uptime
            }
            await ws_connection.send(json.dumps(payload))
            
            # Update bot stats
            bot_stats["uptime"] = uptime
            
        except Exception as e:
            logger.error(f"Failed to send heartbeat: {e}")
            await handle_connection_error()

# Send bot stats to dashboard
async def send_bot_stats():
    if ws_connection and connected_to_dashboard:
        try:
            # Update stats before sending
            bot_stats["connectedServers"] = len(bot.guilds)
            bot_stats["activeUsers"] = sum(guild.member_count for guild in bot.guilds)
            
            payload = {
                "type": "bot_stats",
                "stats": bot_stats
            }
            await ws_connection.send(json.dumps(payload))
            logger.debug(f"Sent bot stats: {bot_stats}")
            
        except Exception as e:
            logger.error(f"Failed to send bot stats: {e}")
            await handle_connection_error()

# Handle WebSocket connection errors
async def handle_connection_error():
    global ws_connection, connected_to_dashboard
    
    logger.info("Handling connection error, trying to reconnect...")
    connected_to_dashboard = False
    
    if ws_connection:
        try:
            await ws_connection.close()
        except:
            pass
        ws_connection = None
    
    # Try to reconnect
    reconnect_attempt = 1
    while not connected_to_dashboard and reconnect_attempt <= 5:
        logger.info(f"Reconnection attempt {reconnect_attempt}/5")
        success = await connect_to_dashboard()
        if success:
            logger.info("Reconnected to dashboard")
            break
        
        reconnect_attempt += 1
        await asyncio.sleep(5 * reconnect_attempt)  # Exponential backoff

# Process incoming messages from the dashboard
async def process_dashboard_messages():
    global ws_connection, connected_to_dashboard
    
    if not ws_connection or not connected_to_dashboard:
        return
    
    try:
        # Check for incoming messages
        while True:
            message = await asyncio.wait_for(ws_connection.recv(), timeout=0.1)
            data = json.loads(message)
            logger.debug(f"Received message from dashboard: {data}")
            
            # Process different message types
            if data.get("type") == "command_request":
                await handle_command_request(data)
            elif data.get("type") == "heartbeat_ack":
                # Dashboard acknowledged our heartbeat
                pass
            elif data.get("type") == "error":
                logger.error(f"Error from dashboard: {data.get('message')}")
    
    except asyncio.TimeoutError:
        # No messages available, this is expected
        pass
    except websockets.exceptions.ConnectionClosed:
        logger.warning("Dashboard WebSocket connection closed")
        connected_to_dashboard = False
        ws_connection = None
    except Exception as e:
        logger.error(f"Error processing dashboard messages: {e}")
        await handle_connection_error()

# Handle command requests from the dashboard
async def handle_command_request(data: Dict[str, Any]):
    command = data.get("command", "")
    params = data.get("params", "")
    request_id = data.get("requestId", "")
    user_id = data.get("userId", "")
    username = data.get("username", "")
    
    logger.info(f"Command request from dashboard: {command} {params} from {username}")
    
    # Process the command
    success = True
    error = None
    result = f"Processed command: {command} with params: {params}"
    
    # Process different commands
    if command == "ping":
        result = f"Pong! Bot latency: {round(bot.latency * 1000)}ms"
    elif command == "help":
        result = "Available commands: ping, help, stats"
    elif command == "stats":
        guild_count = len(bot.guilds)
        member_count = sum(guild.member_count for guild in bot.guilds)
        result = f"Bot Stats:\nServers: {guild_count}\nMembers: {member_count}\nUptime: {format_uptime(bot_stats['uptime'])}"
    else:
        # Command not recognized
        success = False
        error = "Command not recognized"
        result = f"Unknown command: {command}"
    
    # Update command count
    bot_stats["commandsProcessed"] += 1
    await send_bot_stats()
    
    # Send response back to dashboard
    if ws_connection and connected_to_dashboard:
        try:
            response = {
                "type": "command_response",
                "requestId": request_id,
                "userId": user_id,
                "result": result,
                "success": success,
                "error": error
            }
            await ws_connection.send(json.dumps(response))
        except Exception as e:
            logger.error(f"Failed to send command response: {e}")
            await handle_connection_error()

# Background tasks
@tasks.loop(seconds=10)
async def heartbeat_task():
    await send_heartbeat()

@tasks.loop(seconds=30)
async def update_stats_task():
    await send_bot_stats()

@tasks.loop(seconds=1)
async def process_messages_task():
    await process_dashboard_messages()

# Helper to format uptime
def format_uptime(seconds):
    days, remainder = divmod(seconds, 86400)
    hours, remainder = divmod(remainder, 3600)
    minutes, seconds = divmod(remainder, 60)
    
    parts = []
    if days > 0:
        parts.append(f"{days}d")
    if hours > 0:
        parts.append(f"{hours}h")
    if minutes > 0:
        parts.append(f"{minutes}m")
    if seconds > 0 or not parts:
        parts.append(f"{seconds}s")
    
    return " ".join(parts)

# Discord events
@bot.event
async def on_ready():
    logger.info(f"Logged in as {bot.user.name} ({bot.user.id})")
    
    # Update stats initially
    bot_stats["connectedServers"] = len(bot.guilds)
    bot_stats["activeUsers"] = sum(guild.member_count for guild in bot.guilds)
    
    # Connect to dashboard
    await connect_to_dashboard()
    
    # Start background tasks
    if not heartbeat_task.is_running():
        heartbeat_task.start()
    if not update_stats_task.is_running():
        update_stats_task.start()
    if not process_messages_task.is_running():
        process_messages_task.start()

@bot.event
async def on_message(message):
    if message.author.bot:
        return
        
    # Process commands
    await bot.process_commands(message)

@bot.event
async def on_command_completion(ctx):
    # Track command executions
    bot_stats["commandsProcessed"] += 1

# Commands
@bot.command(name="ping")
async def ping(ctx):
    latency = round(bot.latency * 1000)
    await ctx.send(f"Pong! Latency: {latency}ms")

@bot.command(name="help")
async def help_command(ctx):
    embed = discord.Embed(
        title="essence Bot Help",
        description="Here are the available commands:",
        color=discord.Color.blurple()
    )
    
    embed.add_field(name=">ping", value="Check bot response time", inline=False)
    embed.add_field(name=">help", value="Show this help message", inline=False)
    embed.add_field(name=">dashboard", value="Get a link to the bot dashboard", inline=False)
    
    await ctx.send(embed=embed)

@bot.command(name="dashboard")
async def dashboard_command(ctx):
    await ctx.send("Access the bot dashboard at: https://yourdomain.com/dashboard")

# Run the bot
def main():
    try:
        bot.run(TOKEN)
    except Exception as e:
        logger.error(f"Error running bot: {e}")
    finally:
        # Ensure tasks are cancelled
        if heartbeat_task.is_running():
            heartbeat_task.cancel()
        if update_stats_task.is_running():
            update_stats_task.cancel()
        if process_messages_task.is_running():
            process_messages_task.cancel()

if __name__ == "__main__":
    main()