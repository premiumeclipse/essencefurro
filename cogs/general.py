"""
General commands for the essence bot
"""

import time
import datetime
import platform
import discord
from discord.ext import commands

class General(commands.Cog):
    """General commands for server information and bot utilities"""
    
    def __init__(self, bot):
        self.bot = bot
    
    @commands.command(name="ping")
    async def ping(self, ctx):
        """Check the bot's latency"""
        start_time = time.time()
        message = await ctx.send("Pinging...")
        end_time = time.time()
        
        latency = round(self.bot.latency * 1000)
        api_latency = round((end_time - start_time) * 1000)
        
        embed = discord.Embed(title="🏓 Pong!", color=0x9370DB)
        embed.add_field(name="WebSocket Latency", value=f"{latency}ms", inline=True)
        embed.add_field(name="API Latency", value=f"{api_latency}ms", inline=True)
        
        await message.edit(content=None, embed=embed)
    
    @commands.command(name="info", aliases=["botinfo"])
    async def info(self, ctx):
        """Get information about the bot"""
        embed = discord.Embed(
            title="essence Bot Info",
            description="Your all-in-one furro Discord bot :3",
            color=0x9370DB
        )
        
        # Calculate uptime
        uptime = datetime.datetime.now() - self.bot.start_time
        uptime_str = str(uptime).split('.')[0]  # Remove microseconds
        
        # Get statistics
        guild_count = len(self.bot.guilds)
        member_count = sum(g.member_count for g in self.bot.guilds)
        
        # Add fields
        embed.add_field(name="Servers", value=f"{guild_count:,}", inline=True)
        embed.add_field(name="Users", value=f"{member_count:,}", inline=True)
        embed.add_field(name="Commands Run", value=f"{self.bot.command_counter:,}", inline=True)
        
        embed.add_field(name="Uptime", value=uptime_str, inline=True)
        embed.add_field(name="Python Version", value=platform.python_version(), inline=True)
        embed.add_field(name="Discord.py Version", value=discord.__version__, inline=True)
        
        embed.add_field(name="Dashboard", value="[Visit Dashboard](https://essencedsc.netlify.app/)", inline=False)
        
        embed.set_footer(text="Made with ❤️ by essence team")
        
        await ctx.send(embed=embed)
    
    @commands.command(name="serverinfo", aliases=["server"])
    @commands.guild_only()
    async def serverinfo(self, ctx):
        """Get information about the current server"""
        guild = ctx.guild
        
        # Calculate roles and emoji counts
        role_count = len(guild.roles)
        emoji_count = len(guild.emojis)
        
        # Calculate channel counts
        text_channel_count = len(guild.text_channels)
        voice_channel_count = len(guild.voice_channels)
        category_count = len(guild.categories)
        
        # Creation time and formatting
        created_at = guild.created_at.strftime("%B %d, %Y")
        
        # Build embed
        embed = discord.Embed(
            title=f"{guild.name} Server Info",
            description=guild.description or "No description set",
            color=0x9370DB
        )
        
        if guild.icon:
            embed.set_thumbnail(url=guild.icon.url)
        
        embed.add_field(name="Owner", value=guild.owner.mention, inline=True)
        embed.add_field(name="Created On", value=created_at, inline=True)
        embed.add_field(name="Server ID", value=guild.id, inline=True)
        
        embed.add_field(name="Members", value=f"{guild.member_count:,}", inline=True)
        embed.add_field(name="Roles", value=role_count, inline=True)
        embed.add_field(name="Emojis", value=emoji_count, inline=True)
        
        embed.add_field(name="Text Channels", value=text_channel_count, inline=True)
        embed.add_field(name="Voice Channels", value=voice_channel_count, inline=True)
        embed.add_field(name="Categories", value=category_count, inline=True)
        
        if guild.premium_subscription_count:
            embed.add_field(name="Boost Level", value=f"Level {guild.premium_tier}", inline=True)
            embed.add_field(name="Boosts", value=guild.premium_subscription_count, inline=True)
        
        embed.set_footer(text=f"Requested by {ctx.author}", icon_url=ctx.author.display_avatar.url)
        
        await ctx.send(embed=embed)
    
    @commands.command(name="invite")
    async def invite(self, ctx):
        """Get the invite link for the bot"""
        permissions = discord.Permissions(
            view_channel=True,
            send_messages=True,
            manage_messages=True,
            embed_links=True,
            attach_files=True,
            read_message_history=True,
            add_reactions=True,
            use_external_emojis=True,
            manage_roles=True
        )
        
        invite_url = discord.utils.oauth_url(
            self.bot.user.id,
            permissions=permissions
        )
        
        embed = discord.Embed(
            title="Invite essence to your server!",
            description="Click the button below to add me to your server.",
            color=0x9370DB
        )
        embed.add_field(name="Invite Link", value=f"[Click Here]({invite_url})")
        embed.add_field(name="Need help?", value="Visit our [dashboard](https://essencedsc.netlify.app/) for help and information.")
        embed.set_footer(text="Your all-in-one furro bot :3")
        
        await ctx.send(embed=embed)
    
    @commands.command(name="help")
    async def help_command(self, ctx, *, command_name=None):
        """Show help for all commands or a specific command"""
        if command_name:
            # Show help for a specific command
            command = self.bot.get_command(command_name)
            if not command:
                await ctx.send(f"Command `{command_name}` not found.")
                return
            
            embed = discord.Embed(
                title=f"Help: {command.name}",
                description=command.help or "No description available.",
                color=0x9370DB
            )
            
            if command.aliases:
                embed.add_field(name="Aliases", value=", ".join(command.aliases), inline=False)
            
            usage = f"{ctx.prefix}{command.name}"
            if command.signature:
                usage += f" {command.signature}"
            embed.add_field(name="Usage", value=f"`{usage}`", inline=False)
            
            await ctx.send(embed=embed)
            
        else:
            # Show all commands grouped by cog
            embed = discord.Embed(
                title="essence Command Help",
                description=f"Use `{ctx.prefix}help <command>` for detailed info on a command.",
                color=0x9370DB
            )
            
            # Get commands by cog
            for cog_name, cog in self.bot.cogs.items():
                # Skip hidden cogs
                if cog_name.startswith("_"):
                    continue
                
                # Get visible commands in this cog
                cog_commands = [cmd for cmd in cog.get_commands() 
                               if not cmd.hidden and cmd.enabled]
                
                if cog_commands:
                    command_list = ", ".join(f"`{cmd.name}`" for cmd in cog_commands)
                    embed.add_field(name=cog_name, value=command_list, inline=False)
            
            # Add uncategorized commands
            no_cog_commands = [cmd for cmd in self.bot.commands 
                              if not cmd.cog and not cmd.hidden and cmd.enabled]
            
            if no_cog_commands:
                command_list = ", ".join(f"`{cmd.name}`" for cmd in no_cog_commands)
                embed.add_field(name="Miscellaneous", value=command_list, inline=False)
            
            embed.set_footer(text="Your all-in-one furro bot :3")
            await ctx.send(embed=embed)

    @commands.command(name="dashboard", aliases=["dash"])
    async def dashboard(self, ctx):
        """Get a link to the bot dashboard"""
        embed = discord.Embed(
            title="essence Dashboard",
            description="Manage all your server settings through our web dashboard!",
            color=0x9370DB
        )
        embed.add_field(
            name="Dashboard Link", 
            value="[Open Dashboard](https://essencedsc.netlify.app/)",
            inline=False
        )
        embed.set_footer(text="Configure settings, moderation, auto-mod, and more!")
        await ctx.send(embed=embed)

async def setup(bot):
    await bot.add_cog(General(bot))