"""
Moderation commands for the essence bot
"""

import asyncio
import datetime
import re
import discord
from discord.ext import commands
from typing import Optional, Union, List

class Moderation(commands.Cog):
    """Moderation tools for server management"""
    
    def __init__(self, bot):
        self.bot = bot
    
    async def cog_check(self, ctx):
        """Check if the user has permission to use moderation commands"""
        if ctx.guild is None:
            return False
        
        # Allow server owners
        if ctx.author.id == ctx.guild.owner_id:
            return True
        
        # Allow users with manage messages permission
        if ctx.author.guild_permissions.manage_messages:
            return True
        
        return False
    
    @commands.command(name="purge", aliases=["clear"])
    @commands.guild_only()
    @commands.bot_has_permissions(manage_messages=True)
    async def purge(self, ctx, amount: int = 10, user: Optional[discord.Member] = None):
        """Delete a specified number of messages.
        
        Examples:
        >purge 20 - Delete 20 messages
        >purge 5 @user - Delete 5 messages from a specific user
        """
        if amount < 1 or amount > 100:
            return await ctx.send("Please provide a number between 1 and 100.")
        
        await ctx.message.delete()
        
        # Define the check function
        def message_check(message):
            if user:
                return message.author.id == user.id
            return True
        
        # Purge messages
        try:
            deleted = await ctx.channel.purge(limit=amount, check=message_check)
            confirm_msg = await ctx.send(
                f"🧹 Deleted {len(deleted)} messages" + (f" from {user.mention}" if user else "")
            )
            # Auto-delete confirmation after 5 seconds
            await asyncio.sleep(5)
            await confirm_msg.delete()
        except discord.Forbidden:
            await ctx.send("I don't have permission to delete messages!")
        except discord.HTTPException as e:
            await ctx.send(f"Error: {e}")
    
    @commands.command(name="kick")
    @commands.guild_only()
    @commands.bot_has_permissions(kick_members=True)
    async def kick(self, ctx, member: discord.Member, *, reason=None):
        """Kick a member from the server.
        
        Example:
        >kick @user Spamming in chat
        """
        # Check if the bot can kick the user
        if member.id == ctx.guild.owner_id:
            return await ctx.send("I can't kick the server owner!")
        
        if member.top_role >= ctx.author.top_role and ctx.author.id != ctx.guild.owner_id:
            return await ctx.send("You can't kick someone with a higher or equal role!")
        
        if member.top_role >= ctx.guild.me.top_role:
            return await ctx.send("I can't kick this user due to role hierarchy.")
        
        # Format reason
        reason = reason or "No reason provided"
        reason = f"Kicked by {ctx.author} (ID: {ctx.author.id}): {reason}"
        
        # Send DM to the user
        try:
            embed = discord.Embed(
                title=f"You've been kicked from {ctx.guild.name}",
                description=f"Reason: {reason}",
                color=discord.Color.orange()
            )
            await member.send(embed=embed)
        except (discord.HTTPException, discord.Forbidden):
            pass  # Failed to send DM
            
        # Kick the user
        try:
            await member.kick(reason=reason)
            
            # Log the action
            embed = discord.Embed(
                title="Member Kicked",
                description=f"{member.mention} has been kicked from the server.",
                color=discord.Color.orange(),
                timestamp=datetime.datetime.now()
            )
            embed.add_field(name="Reason", value=reason, inline=False)
            embed.set_thumbnail(url=member.display_avatar.url)
            embed.set_footer(text=f"User ID: {member.id}")
            
            await ctx.send(embed=embed)
            
        except discord.Forbidden:
            await ctx.send("I don't have permission to kick that user!")
        except discord.HTTPException as e:
            await ctx.send(f"Failed to kick user: {e}")
    
    @commands.command(name="ban")
    @commands.guild_only()
    @commands.bot_has_permissions(ban_members=True)
    async def ban(self, ctx, member: Union[discord.Member, discord.User], *, reason=None):
        """Ban a member from the server.
        
        Example:
        >ban @user Repeated violation of rules
        """
        # If it's a member (in the server), do additional checks
        if isinstance(member, discord.Member):
            if member.id == ctx.guild.owner_id:
                return await ctx.send("I can't ban the server owner!")
            
            if member.top_role >= ctx.author.top_role and ctx.author.id != ctx.guild.owner_id:
                return await ctx.send("You can't ban someone with a higher or equal role!")
            
            if member.top_role >= ctx.guild.me.top_role:
                return await ctx.send("I can't ban this user due to role hierarchy.")
        
        # Format reason
        reason = reason or "No reason provided"
        reason = f"Banned by {ctx.author} (ID: {ctx.author.id}): {reason}"
        
        # Send DM to the user if they're in the server
        if isinstance(member, discord.Member):
            try:
                embed = discord.Embed(
                    title=f"You've been banned from {ctx.guild.name}",
                    description=f"Reason: {reason}",
                    color=discord.Color.red()
                )
                await member.send(embed=embed)
            except (discord.HTTPException, discord.Forbidden):
                pass  # Failed to send DM
            
        # Ban the user
        try:
            await ctx.guild.ban(member, reason=reason, delete_message_days=0)
            
            # Log the action
            embed = discord.Embed(
                title="Member Banned",
                description=f"{member.mention} has been banned from the server.",
                color=discord.Color.red(),
                timestamp=datetime.datetime.now()
            )
            embed.add_field(name="Reason", value=reason, inline=False)
            
            if hasattr(member, 'display_avatar'):
                embed.set_thumbnail(url=member.display_avatar.url)
                
            embed.set_footer(text=f"User ID: {member.id}")
            
            await ctx.send(embed=embed)
            
        except discord.Forbidden:
            await ctx.send("I don't have permission to ban that user!")
        except discord.HTTPException as e:
            await ctx.send(f"Failed to ban user: {e}")
    
    @commands.command(name="unban")
    @commands.guild_only()
    @commands.bot_has_permissions(ban_members=True)
    async def unban(self, ctx, user_id: int, *, reason=None):
        """Unban a user by their ID.
        
        Example:
        >unban 123456789012345678 User has apologized
        """
        reason = reason or "No reason provided"
        reason = f"Unbanned by {ctx.author} (ID: {ctx.author.id}): {reason}"
        
        try:
            # Get ban entry
            ban_entry = None
            bans = await ctx.guild.bans()
            for ban in bans:
                if ban.user.id == user_id:
                    ban_entry = ban
                    break
            
            if not ban_entry:
                return await ctx.send(f"No banned user found with ID {user_id}")
            
            # Unban the user
            await ctx.guild.unban(ban_entry.user, reason=reason)
            
            # Log the action
            embed = discord.Embed(
                title="User Unbanned",
                description=f"{ban_entry.user.mention} has been unbanned from the server.",
                color=discord.Color.green(),
                timestamp=datetime.datetime.now()
            )
            embed.add_field(name="Reason", value=reason, inline=False)
            embed.set_thumbnail(url=ban_entry.user.display_avatar.url)
            embed.set_footer(text=f"User ID: {ban_entry.user.id}")
            
            await ctx.send(embed=embed)
            
        except discord.Forbidden:
            await ctx.send("I don't have permission to unban users!")
        except discord.HTTPException as e:
            await ctx.send(f"Failed to unban user: {e}")
    
    @commands.command(name="mute", aliases=["timeout"])
    @commands.guild_only()
    @commands.bot_has_permissions(moderate_members=True)
    async def mute(self, ctx, member: discord.Member, duration: str, *, reason=None):
        """Timeout/mute a member for a specified duration.
        
        Duration format: 1d, 2h, 30m, 45s, or combinations like 1d2h30m
        
        Example:
        >mute @user 2h Excessive spam
        """
        if member.id == ctx.guild.owner_id:
            return await ctx.send("I can't mute the server owner!")
        
        if member.top_role >= ctx.author.top_role and ctx.author.id != ctx.guild.owner_id:
            return await ctx.send("You can't mute someone with a higher or equal role!")
        
        if member.top_role >= ctx.guild.me.top_role:
            return await ctx.send("I can't mute this user due to role hierarchy.")
        
        # Parse duration
        total_seconds = 0
        match = re.findall(r'(\d+)([dhms])', duration.lower())
        
        if not match:
            return await ctx.send("Invalid duration format. Use combinations of d (days), h (hours), m (minutes), s (seconds). Example: 3h30m")
        
        for value, unit in match:
            if unit == 'd':
                total_seconds += int(value) * 86400  # days
            elif unit == 'h':
                total_seconds += int(value) * 3600   # hours
            elif unit == 'm':
                total_seconds += int(value) * 60     # minutes
            elif unit == 's':
                total_seconds += int(value)          # seconds
        
        # Make sure the duration is within Discord's limits (max 28 days)
        max_timeout = 60 * 60 * 24 * 28  # 28 days in seconds
        if total_seconds < 1:
            return await ctx.send("Duration must be at least 1 second.")
        if total_seconds > max_timeout:
            return await ctx.send("Duration cannot exceed 28 days.")
        
        # Format reason
        reason = reason or "No reason provided"
        reason = f"Timed out by {ctx.author} (ID: {ctx.author.id}): {reason}"
        
        # Calculate the expiry time
        until = datetime.datetime.now() + datetime.timedelta(seconds=total_seconds)
        
        # Format duration for display
        duration_text = ""
        days = total_seconds // 86400
        hours = (total_seconds % 86400) // 3600
        minutes = (total_seconds % 3600) // 60
        seconds = total_seconds % 60
        
        if days:
            duration_text += f"{days} day{'s' if days != 1 else ''} "
        if hours:
            duration_text += f"{hours} hour{'s' if hours != 1 else ''} "
        if minutes:
            duration_text += f"{minutes} minute{'s' if minutes != 1 else ''} "
        if seconds:
            duration_text += f"{seconds} second{'s' if seconds != 1 else ''}"
        
        duration_text = duration_text.strip()
        
        # Send DM to the user
        try:
            embed = discord.Embed(
                title=f"You've been timed out in {ctx.guild.name}",
                description=f"Duration: {duration_text}\nReason: {reason}",
                color=discord.Color.orange()
            )
            await member.send(embed=embed)
        except (discord.HTTPException, discord.Forbidden):
            pass  # Failed to send DM
            
        # Timeout the user
        try:
            await member.timeout(until, reason=reason)
            
            # Log the action
            embed = discord.Embed(
                title="Member Timed Out",
                description=f"{member.mention} has been timed out.",
                color=discord.Color.orange(),
                timestamp=datetime.datetime.now()
            )
            embed.add_field(name="Duration", value=duration_text, inline=True)
            embed.add_field(name="Expires", value=discord.utils.format_dt(until, 'R'), inline=True)
            embed.add_field(name="Reason", value=reason, inline=False)
            embed.set_thumbnail(url=member.display_avatar.url)
            embed.set_footer(text=f"User ID: {member.id}")
            
            await ctx.send(embed=embed)
            
        except discord.Forbidden:
            await ctx.send("I don't have permission to timeout that user!")
        except discord.HTTPException as e:
            await ctx.send(f"Failed to timeout user: {e}")
    
    @commands.command(name="unmute", aliases=["untimeout"])
    @commands.guild_only()
    @commands.bot_has_permissions(moderate_members=True)
    async def unmute(self, ctx, member: discord.Member, *, reason=None):
        """Remove a timeout/mute from a member.
        
        Example:
        >unmute @user Issue resolved
        """
        # Check if the user is timed out
        if not member.is_timed_out():
            return await ctx.send(f"{member.mention} is not timed out.")
        
        # Format reason
        reason = reason or "No reason provided"
        reason = f"Timeout removed by {ctx.author} (ID: {ctx.author.id}): {reason}"
        
        # Remove timeout
        try:
            await member.timeout(None, reason=reason)
            
            # Log the action
            embed = discord.Embed(
                title="Timeout Removed",
                description=f"{member.mention}'s timeout has been removed.",
                color=discord.Color.green(),
                timestamp=datetime.datetime.now()
            )
            embed.add_field(name="Reason", value=reason, inline=False)
            embed.set_thumbnail(url=member.display_avatar.url)
            embed.set_footer(text=f"User ID: {member.id}")
            
            await ctx.send(embed=embed)
            
        except discord.Forbidden:
            await ctx.send("I don't have permission to remove timeouts!")
        except discord.HTTPException as e:
            await ctx.send(f"Failed to remove timeout: {e}")
    
    @commands.command(name="warn")
    @commands.guild_only()
    async def warn(self, ctx, member: discord.Member, *, reason=None):
        """Warn a user for rule violation.
        
        Example:
        >warn @user Please follow the server rules
        """
        if member.id == ctx.guild.owner_id:
            return await ctx.send("I can't warn the server owner!")
        
        if member.bot:
            return await ctx.send("I can't warn a bot!")
        
        # Format reason
        reason = reason or "No reason provided"
        
        # Try to DM the user
        try:
            embed = discord.Embed(
                title=f"Warning from {ctx.guild.name}",
                description=f"You have been warned by {ctx.author.mention}",
                color=discord.Color.yellow(),
                timestamp=datetime.datetime.now()
            )
            embed.add_field(name="Reason", value=reason, inline=False)
            
            await member.send(embed=embed)
            dm_sent = True
        except (discord.HTTPException, discord.Forbidden):
            dm_sent = False
        
        # Send confirmation to channel
        embed = discord.Embed(
            title="User Warned",
            description=f"{member.mention} has been warned.",
            color=discord.Color.yellow(),
            timestamp=datetime.datetime.now()
        )
        embed.add_field(name="Reason", value=reason, inline=False)
        embed.add_field(name="DM Notification", value="Sent ✅" if dm_sent else "Failed ❌", inline=True)
        embed.set_thumbnail(url=member.display_avatar.url)
        embed.set_footer(text=f"User ID: {member.id}")
        
        await ctx.send(embed=embed)
    
    @commands.command(name="slowmode")
    @commands.guild_only()
    @commands.bot_has_permissions(manage_channels=True)
    async def slowmode(self, ctx, seconds: int = 0):
        """Set the slowmode delay for the current channel.
        
        Example:
        >slowmode 5 - Set 5 second delay
        >slowmode 0 - Turn off slowmode
        """
        if seconds < 0 or seconds > 21600:
            return await ctx.send("Slowmode delay must be between 0 and 21600 seconds (6 hours).")
        
        await ctx.channel.edit(slowmode_delay=seconds)
        
        if seconds == 0:
            await ctx.send("🐢 Slowmode has been disabled for this channel.")
        else:
            await ctx.send(f"🐢 Slowmode set to {seconds} second(s) for this channel.")
            
    @commands.group(name="role", invoke_without_command=True)
    @commands.guild_only()
    @commands.bot_has_permissions(manage_roles=True)
    async def role(self, ctx):
        """Manage roles. Use subcommands add/remove/list."""
        await ctx.send(f"Please specify a subcommand: `{ctx.prefix}role add`, `{ctx.prefix}role remove`, or `{ctx.prefix}role list`")
        
    @role.command(name="add")
    @commands.guild_only()
    @commands.bot_has_permissions(manage_roles=True)
    async def role_add(self, ctx, member: discord.Member, *, role: discord.Role):
        """Add a role to a member.
        
        Example:
        >role add @user @Moderator
        """
        if role >= ctx.author.top_role and ctx.author.id != ctx.guild.owner_id:
            return await ctx.send("You can't assign a role higher than or equal to your highest role!")
        
        if role >= ctx.guild.me.top_role:
            return await ctx.send("I can't assign that role due to role hierarchy.")
        
        if role in member.roles:
            return await ctx.send(f"{member.mention} already has the {role.mention} role.")
        
        try:
            await member.add_roles(role, reason=f"Role added by {ctx.author}")
            await ctx.send(f"✅ Added {role.mention} to {member.mention}")
        except discord.Forbidden:
            await ctx.send("I don't have permission to manage roles!")
        except discord.HTTPException as e:
            await ctx.send(f"Error adding role: {e}")
            
    @role.command(name="remove")
    @commands.guild_only()
    @commands.bot_has_permissions(manage_roles=True)
    async def role_remove(self, ctx, member: discord.Member, *, role: discord.Role):
        """Remove a role from a member.
        
        Example:
        >role remove @user @Moderator
        """
        if role >= ctx.author.top_role and ctx.author.id != ctx.guild.owner_id:
            return await ctx.send("You can't remove a role higher than or equal to your highest role!")
        
        if role >= ctx.guild.me.top_role:
            return await ctx.send("I can't remove that role due to role hierarchy.")
        
        if role not in member.roles:
            return await ctx.send(f"{member.mention} doesn't have the {role.mention} role.")
        
        try:
            await member.remove_roles(role, reason=f"Role removed by {ctx.author}")
            await ctx.send(f"✅ Removed {role.mention} from {member.mention}")
        except discord.Forbidden:
            await ctx.send("I don't have permission to manage roles!")
        except discord.HTTPException as e:
            await ctx.send(f"Error removing role: {e}")
            
    @role.command(name="list")
    @commands.guild_only()
    async def role_list(self, ctx, member: Optional[discord.Member] = None):
        """List all roles in the server or a member's roles.
        
        Example:
        >role list - List all server roles
        >role list @user - List a member's roles
        """
        if member:
            # List member's roles
            roles = [role.mention for role in reversed(member.roles) if role != ctx.guild.default_role]
            
            if not roles:
                return await ctx.send(f"{member.mention} has no roles.")
            
            embed = discord.Embed(
                title=f"Roles for {member.display_name}",
                description=" ".join(roles) if roles else "No roles",
                color=member.color,
                timestamp=datetime.datetime.now()
            )
            embed.set_thumbnail(url=member.display_avatar.url)
            embed.set_footer(text=f"Total: {len(roles)} roles")
            
            await ctx.send(embed=embed)
            
        else:
            # List all server roles
            roles = [role.mention for role in reversed(ctx.guild.roles) if role != ctx.guild.default_role]
            
            # Split into pages if there are too many roles
            if len(roles) > 50:
                chunks = [roles[i:i + 50] for i in range(0, len(roles), 50)]
                
                for i, chunk in enumerate(chunks):
                    embed = discord.Embed(
                        title=f"Roles in {ctx.guild.name} - Page {i+1}/{len(chunks)}",
                        description=" ".join(chunk),
                        color=0x9370DB,
                        timestamp=datetime.datetime.now()
                    )
                    embed.set_footer(text=f"Total: {len(roles)} roles")
                    await ctx.send(embed=embed)
            else:
                embed = discord.Embed(
                    title=f"Roles in {ctx.guild.name}",
                    description=" ".join(roles) if roles else "No roles",
                    color=0x9370DB,
                    timestamp=datetime.datetime.now()
                )
                embed.set_footer(text=f"Total: {len(roles)} roles")
                await ctx.send(embed=embed)
            
async def setup(bot):
    await bot.add_cog(Moderation(bot))