"""
Auto-moderation functionality for the essence bot
"""

import re
import discord
from discord.ext import commands
from typing import Dict, List, Set, Union, Optional
import asyncio
import datetime

class AutoMod(commands.Cog):
    """Automatic moderation systems for server management"""
    
    def __init__(self, bot):
        self.bot = bot
        # Cache of automod settings
        self.settings_cache: Dict[int, Dict] = {}
        # Track message counts for anti-spam
        self.message_count: Dict[int, Dict[int, List[float]]] = {}
        # Track mention counts for anti-mention spam
        self.mention_count: Dict[int, Dict[int, List[float]]] = {}
        # Track repeated message content for anti-spam
        self.last_messages: Dict[int, Dict[int, List[str]]] = {}
        
        # Start the cleanup task
        self.cleanup_task = asyncio.create_task(self.cleanup_tracking_data())
    
    def cog_unload(self):
        """Called when the cog is unloaded"""
        # Cancel the cleanup task when the cog is unloaded
        if self.cleanup_task:
            self.cleanup_task.cancel()
    
    async def cleanup_tracking_data(self):
        """Periodically clean up tracking data to prevent memory leaks"""
        while True:
            try:
                # Wait for 5 minutes before cleaning
                await asyncio.sleep(300)
                
                # Get current time
                now = datetime.datetime.now().timestamp()
                
                # Clean up message tracking (keep the last 60 seconds only)
                for guild_id in list(self.message_count.keys()):
                    for user_id in list(self.message_count[guild_id].keys()):
                        self.message_count[guild_id][user_id] = [
                            t for t in self.message_count[guild_id][user_id] if now - t <= 60
                        ]
                        if not self.message_count[guild_id][user_id]:
                            del self.message_count[guild_id][user_id]
                    
                    if not self.message_count[guild_id]:
                        del self.message_count[guild_id]
                
                # Clean up mention tracking (keep the last 60 seconds only)
                for guild_id in list(self.mention_count.keys()):
                    for user_id in list(self.mention_count[guild_id].keys()):
                        self.mention_count[guild_id][user_id] = [
                            t for t in self.mention_count[guild_id][user_id] if now - t <= 60
                        ]
                        if not self.mention_count[guild_id][user_id]:
                            del self.mention_count[guild_id][user_id]
                    
                    if not self.mention_count[guild_id]:
                        del self.mention_count[guild_id]
                
                # Clean up last messages (keep the last 5 messages)
                for guild_id in list(self.last_messages.keys()):
                    for user_id in list(self.last_messages[guild_id].keys()):
                        if len(self.last_messages[guild_id][user_id]) > 5:
                            self.last_messages[guild_id][user_id] = self.last_messages[guild_id][user_id][-5:]
                        if not self.last_messages[guild_id][user_id]:
                            del self.last_messages[guild_id][user_id]
                    
                    if not self.last_messages[guild_id]:
                        del self.last_messages[guild_id]
                        
            except asyncio.CancelledError:
                # Task was cancelled, exit
                break
            except Exception as e:
                # Log error but continue the task
                print(f"Error in cleanup task: {e}")
                continue
    
    @commands.Cog.listener()
    async def on_message(self, message: discord.Message):
        """Check messages for automod violations"""
        # Skip if not in a guild, or if message is from a bot
        if not message.guild or message.author.bot:
            return
        
        # Skip if the message is from a moderator or admin
        if isinstance(message.author, discord.Member):
            if message.author.guild_permissions.manage_messages:
                return
        
        # Get automod settings for this guild
        # In a real bot, these would come from a database
        settings = self.get_automod_settings(message.guild.id)
        
        # Skip if automod is disabled for this guild
        if not settings.get('enabled', False):
            return
        
        # Check for invite links
        if settings.get('block_invites', False) and not self.is_channel_exempt(message.channel.id, settings, 'invite_exempt_channels'):
            if await self.check_for_invites(message):
                return
        
        # Check for banned words
        if settings.get('banned_words', []) and not self.is_channel_exempt(message.channel.id, settings, 'word_filter_exempt_channels'):
            if await self.check_for_banned_words(message, settings.get('banned_words', [])):
                return
        
        # Check for spam
        if settings.get('anti_spam', False) and not self.is_channel_exempt(message.channel.id, settings, 'spam_exempt_channels'):
            if await self.check_for_spam(message):
                return
        
        # Check for mention spam
        if settings.get('anti_mention_spam', False) and not self.is_channel_exempt(message.channel.id, settings, 'mention_exempt_channels'):
            if await self.check_for_mention_spam(message, settings.get('max_mentions', 5)):
                return
    
    def get_automod_settings(self, guild_id: int) -> Dict:
        """Get automod settings for a guild
        
        In a real bot, these would be loaded from a database.
        Currently returns default settings for testing.
        """
        # Check cache first
        if guild_id in self.settings_cache:
            return self.settings_cache[guild_id]
        
        # Default settings
        settings = {
            'enabled': True,
            'block_invites': True,
            'banned_words': [
                'badword1', 'badword2', 'badword3',
                # Add more banned words here
            ],
            'anti_spam': True,
            'anti_mention_spam': True,
            'max_mentions': 5,
            'invite_exempt_channels': [],
            'word_filter_exempt_channels': [],
            'spam_exempt_channels': [],
            'mention_exempt_channels': [],
            'log_channel': None  # Channel ID for logging
        }
        
        # Cache the settings
        self.settings_cache[guild_id] = settings
        
        return settings
    
    def is_channel_exempt(self, channel_id: int, settings: Dict, exempt_key: str) -> bool:
        """Check if a channel is exempt from a specific automod feature"""
        exempt_channels = settings.get(exempt_key, [])
        return channel_id in exempt_channels
    
    async def check_for_invites(self, message: discord.Message) -> bool:
        """Check if the message contains Discord invite links
        
        Returns True if action was taken
        """
        # Simple regex for Discord invites
        invite_regex = r"(discord\.gg|discord\.com\/invite|discordapp\.com\/invite)\/[a-zA-Z0-9]+"
        
        if re.search(invite_regex, message.content, re.IGNORECASE):
            # Take action - delete the message and warn the user
            try:
                await message.delete()
                
                # Send warning
                warning = await message.channel.send(
                    f"{message.author.mention} Discord invites are not allowed in this server!",
                    delete_after=10
                )
                
                # Log the action
                await self.log_automod_action(
                    message.guild,
                    "Invite Link Blocked",
                    f"Message from {message.author.mention} was deleted for containing an invite link.",
                    message.author,
                    message.content
                )
                
                return True
            
            except discord.Forbidden:
                # Bot doesn't have permission to delete messages
                pass
            except discord.NotFound:
                # Message was already deleted
                pass
            
        return False
    
    async def check_for_banned_words(self, message: discord.Message, banned_words: List[str]) -> bool:
        """Check if the message contains banned words
        
        Returns True if action was taken
        """
        content_lower = message.content.lower()
        
        # Check each banned word
        for word in banned_words:
            if word.lower() in content_lower:
                # Take action - delete the message and warn the user
                try:
                    await message.delete()
                    
                    # Send warning
                    warning = await message.channel.send(
                        f"{message.author.mention} Your message was removed for containing inappropriate language.",
                        delete_after=10
                    )
                    
                    # Log the action
                    await self.log_automod_action(
                        message.guild,
                        "Banned Word Filtered",
                        f"Message from {message.author.mention} was deleted for containing a banned word.",
                        message.author,
                        message.content
                    )
                    
                    return True
                
                except discord.Forbidden:
                    # Bot doesn't have permission to delete messages
                    pass
                except discord.NotFound:
                    # Message was already deleted
                    pass
                
                break
        
        return False
    
    async def check_for_spam(self, message: discord.Message) -> bool:
        """Check if the user is spamming messages
        
        Returns True if action was taken
        """
        guild_id = message.guild.id
        user_id = message.author.id
        current_time = datetime.datetime.now().timestamp()
        
        # Initialize tracking data if needed
        if guild_id not in self.message_count:
            self.message_count[guild_id] = {}
        
        if user_id not in self.message_count[guild_id]:
            self.message_count[guild_id][user_id] = []
        
        if guild_id not in self.last_messages:
            self.last_messages[guild_id] = {}
        
        if user_id not in self.last_messages[guild_id]:
            self.last_messages[guild_id][user_id] = []
        
        # Add current message timestamp to tracking
        self.message_count[guild_id][user_id].append(current_time)
        
        # Add message content to tracking (for repeated content)
        self.last_messages[guild_id][user_id].append(message.content)
        
        # Get timestamps from the last 5 seconds
        recent_messages = [
            t for t in self.message_count[guild_id][user_id]
            if current_time - t <= 5
        ]
        
        # Check if there are too many messages in quick succession (more than 5 in 5 seconds)
        if len(recent_messages) >= 5:
            # Take action - timeout the user
            try:
                # Remove outdated timestamps
                self.message_count[guild_id][user_id] = [
                    t for t in self.message_count[guild_id][user_id]
                    if current_time - t <= 60
                ]
                
                # Calculate timeout duration (2 minutes)
                timeout_duration = datetime.timedelta(minutes=2)
                
                # Apply timeout
                await message.author.timeout_for(timeout_duration, reason="Automod: Message spam detected")
                
                # Delete the spam messages
                async for msg in message.channel.history(limit=10):
                    if msg.author.id == user_id and current_time - msg.created_at.timestamp() <= 10:
                        try:
                            await msg.delete()
                        except (discord.Forbidden, discord.NotFound):
                            pass
                
                # Notify the user
                warning = await message.channel.send(
                    f"{message.author.mention} has been timed out for 2 minutes for spamming.",
                    delete_after=10
                )
                
                # Log the action
                await self.log_automod_action(
                    message.guild,
                    "Spam Detection",
                    f"{message.author.mention} has been timed out for 2 minutes for sending messages too quickly.",
                    message.author,
                    f"Sent {len(recent_messages)} messages in 5 seconds"
                )
                
                return True
            
            except discord.Forbidden:
                # Bot doesn't have permission to timeout users
                pass
            except discord.HTTPException as e:
                # API error
                print(f"Error timing out user: {e}")
        
        # Check for repeated messages (3+ identical messages in a row)
        if len(self.last_messages[guild_id][user_id]) >= 3:
            last_three = self.last_messages[guild_id][user_id][-3:]
            if len(set(last_three)) == 1:  # All three messages are identical
                # Take action - delete the repeated messages and warn
                try:
                    # Delete the last message (current one)
                    await message.delete()
                    
                    # Send warning
                    warning = await message.channel.send(
                        f"{message.author.mention} Please don't send the same message repeatedly.",
                        delete_after=10
                    )
                    
                    # Log the action
                    await self.log_automod_action(
                        message.guild,
                        "Repeated Messages",
                        f"Message from {message.author.mention} was deleted for sending the same content repeatedly.",
                        message.author,
                        message.content
                    )
                    
                    return True
                
                except discord.Forbidden:
                    # Bot doesn't have permission to delete messages
                    pass
                except discord.NotFound:
                    # Message was already deleted
                    pass
        
        return False
    
    async def check_for_mention_spam(self, message: discord.Message, max_mentions: int) -> bool:
        """Check if the message contains too many mentions
        
        Returns True if action was taken
        """
        # Count mentions in the message
        total_mentions = len(message.mentions) + len(message.role_mentions)
        
        # Skip if under the limit
        if total_mentions <= max_mentions:
            return False
        
        # Take action - delete the message and timeout the user
        try:
            await message.delete()
            
            # Calculate timeout duration (10 minutes)
            timeout_duration = datetime.timedelta(minutes=10)
            
            # Apply timeout
            await message.author.timeout_for(timeout_duration, reason="Automod: Mention spam detected")
            
            # Notify the user
            warning = await message.channel.send(
                f"{message.author.mention} has been timed out for 10 minutes for mention spam. ({total_mentions} mentions)",
                delete_after=10
            )
            
            # Log the action
            await self.log_automod_action(
                message.guild,
                "Mention Spam",
                f"{message.author.mention} has been timed out for 10 minutes for mention spam.",
                message.author,
                f"Message contained {total_mentions} mentions (max: {max_mentions})"
            )
            
            return True
        
        except discord.Forbidden:
            # Bot doesn't have permission to timeout users or delete messages
            pass
        except discord.NotFound:
            # Message was already deleted
            pass
        
        return False
    
    async def log_automod_action(self, guild: discord.Guild, action_type: str, description: str, user: discord.Member, content: str = None) -> None:
        """Log an automod action to the designated log channel"""
        # Get settings for this guild
        settings = self.get_automod_settings(guild.id)
        log_channel_id = settings.get('log_channel')
        
        if not log_channel_id:
            return  # No log channel set
        
        # Get the log channel
        log_channel = guild.get_channel(log_channel_id)
        if not log_channel:
            return  # Log channel not found
        
        # Create the embed
        embed = discord.Embed(
            title=f"Automod: {action_type}",
            description=description,
            color=discord.Color.orange(),
            timestamp=datetime.datetime.now()
        )
        
        # Add user information
        embed.add_field(name="User", value=f"{user.mention} ({user.name}#{user.discriminator})", inline=True)
        embed.add_field(name="User ID", value=user.id, inline=True)
        
        # Add message content if provided
        if content:
            # Truncate content if it's too long
            if len(content) > 1024:
                content = content[:1021] + "..."
            embed.add_field(name="Content", value=content, inline=False)
        
        # Set author information
        embed.set_author(name=f"{user.name}#{user.discriminator}", icon_url=user.display_avatar.url)
        
        # Set footer
        embed.set_footer(text=f"Automod Action • {guild.name}")
        
        # Send the log message
        try:
            await log_channel.send(embed=embed)
        except (discord.Forbidden, discord.HTTPException):
            # Failed to send to log channel
            pass
    
    @commands.group(name="automod", aliases=["am"], invoke_without_command=True)
    @commands.guild_only()
    @commands.has_permissions(manage_guild=True)
    async def automod(self, ctx):
        """Configure the auto-moderation system.
        
        Use subcommands to configure different features:
        - enable / disable
        - invites
        - wordfilter
        - spam
        - mentions
        """
        # Show current settings
        settings = self.get_automod_settings(ctx.guild.id)
        
        embed = discord.Embed(
            title="AutoMod Configuration",
            description="Current auto-moderation settings for this server.",
            color=0x9370DB
        )
        
        status = "Enabled ✅" if settings.get('enabled', False) else "Disabled ❌"
        embed.add_field(name="Status", value=status, inline=False)
        
        features = []
        if settings.get('block_invites', False):
            features.append("• Invite Filter: Enabled ✅")
        else:
            features.append("• Invite Filter: Disabled ❌")
            
        if settings.get('banned_words', []):
            features.append(f"• Word Filter: Enabled ✅ ({len(settings.get('banned_words', []))} words)")
        else:
            features.append("• Word Filter: Disabled ❌")
            
        if settings.get('anti_spam', False):
            features.append("• Anti-Spam: Enabled ✅")
        else:
            features.append("• Anti-Spam: Disabled ❌")
            
        if settings.get('anti_mention_spam', False):
            features.append(f"• Anti-Mention Spam: Enabled ✅ (Max: {settings.get('max_mentions', 5)})")
        else:
            features.append("• Anti-Mention Spam: Disabled ❌")
        
        embed.add_field(name="Features", value="\n".join(features), inline=False)
        
        log_channel_id = settings.get('log_channel')
        if log_channel_id:
            log_channel = ctx.guild.get_channel(log_channel_id)
            if log_channel:
                embed.add_field(name="Log Channel", value=log_channel.mention, inline=False)
            else:
                embed.add_field(name="Log Channel", value="Invalid channel (ID: {log_channel_id})", inline=False)
        else:
            embed.add_field(name="Log Channel", value="Not set", inline=False)
        
        embed.set_footer(text=f"Use {ctx.prefix}automod help for more information")
        
        await ctx.send(embed=embed)
    
    @automod.command(name="enable")
    @commands.guild_only()
    @commands.has_permissions(manage_guild=True)
    async def automod_enable(self, ctx):
        """Enable the auto-moderation system."""
        settings = self.get_automod_settings(ctx.guild.id)
        
        if settings.get('enabled', False):
            return await ctx.send("🛡️ AutoMod is already enabled.")
        
        # Update settings
        settings['enabled'] = True
        self.settings_cache[ctx.guild.id] = settings
        
        # In a real bot, save to database here
        
        await ctx.send("🛡️ AutoMod has been enabled for this server.")
    
    @automod.command(name="disable")
    @commands.guild_only()
    @commands.has_permissions(manage_guild=True)
    async def automod_disable(self, ctx):
        """Disable the auto-moderation system."""
        settings = self.get_automod_settings(ctx.guild.id)
        
        if not settings.get('enabled', False):
            return await ctx.send("🛡️ AutoMod is already disabled.")
        
        # Update settings
        settings['enabled'] = False
        self.settings_cache[ctx.guild.id] = settings
        
        # In a real bot, save to database here
        
        await ctx.send("🛡️ AutoMod has been disabled for this server.")
    
    @automod.group(name="invites", invoke_without_command=True)
    @commands.guild_only()
    @commands.has_permissions(manage_guild=True)
    async def automod_invites(self, ctx):
        """Configure invite link blocking."""
        settings = self.get_automod_settings(ctx.guild.id)
        
        status = "Enabled ✅" if settings.get('block_invites', False) else "Disabled ❌"
        
        embed = discord.Embed(
            title="AutoMod Invite Filter",
            description=f"Status: {status}\n\nThis feature automatically deletes Discord invite links.",
            color=0x9370DB
        )
        
        exempt_channels = []
        for channel_id in settings.get('invite_exempt_channels', []):
            channel = ctx.guild.get_channel(channel_id)
            if channel:
                exempt_channels.append(channel.mention)
        
        if exempt_channels:
            embed.add_field(name="Exempt Channels", value=", ".join(exempt_channels), inline=False)
        
        embed.set_footer(text=f"Use {ctx.prefix}automod invites enable/disable")
        
        await ctx.send(embed=embed)
    
    @automod_invites.command(name="enable")
    async def invites_enable(self, ctx):
        """Enable invite link blocking."""
        settings = self.get_automod_settings(ctx.guild.id)
        
        if settings.get('block_invites', False):
            return await ctx.send("🔗 Invite link blocking is already enabled.")
        
        # Update settings
        settings['block_invites'] = True
        self.settings_cache[ctx.guild.id] = settings
        
        # In a real bot, save to database here
        
        await ctx.send("🔗 Invite link blocking has been enabled.")
    
    @automod_invites.command(name="disable")
    async def invites_disable(self, ctx):
        """Disable invite link blocking."""
        settings = self.get_automod_settings(ctx.guild.id)
        
        if not settings.get('block_invites', False):
            return await ctx.send("🔗 Invite link blocking is already disabled.")
        
        # Update settings
        settings['block_invites'] = False
        self.settings_cache[ctx.guild.id] = settings
        
        # In a real bot, save to database here
        
        await ctx.send("🔗 Invite link blocking has been disabled.")
    
    @automod.command(name="log")
    @commands.guild_only()
    @commands.has_permissions(manage_guild=True)
    async def automod_log(self, ctx, channel: discord.TextChannel = None):
        """Set or view the automod log channel.
        
        Example:
        >automod log #mod-logs - Set log channel
        >automod log - View current log channel
        """
        settings = self.get_automod_settings(ctx.guild.id)
        
        if channel is None:
            # Show current log channel
            log_channel_id = settings.get('log_channel')
            if log_channel_id:
                log_channel = ctx.guild.get_channel(log_channel_id)
                if log_channel:
                    return await ctx.send(f"📝 The current automod log channel is {log_channel.mention}")
                else:
                    return await ctx.send("📝 The log channel is set to an invalid channel. Please set a new one.")
            else:
                return await ctx.send("📝 No log channel is currently set. Use this command with a channel to set one.")
        
        # Set log channel
        settings['log_channel'] = channel.id
        self.settings_cache[ctx.guild.id] = settings
        
        # In a real bot, save to database here
        
        await ctx.send(f"📝 Automod logs will now be sent to {channel.mention}")

async def setup(bot):
    await bot.add_cog(AutoMod(bot))