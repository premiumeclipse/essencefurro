"""
Fun commands for the essence bot
"""

import random
import aiohttp
import discord
from discord.ext import commands

class Fun(commands.Cog):
    """Fun and social commands for server enjoyment"""
    
    def __init__(self, bot):
        self.bot = bot
    
    @commands.command(name="uwu")
    async def uwu(self, ctx):
        """UwU-ify your text or a random UwU message.
        
        Example:
        >uwu
        >uwu Hello there, how are you?
        """
        responses = [
            "*nuzzles and wuzzles your chest* uwu you so warm :3",
            "*notices your bulge* OwO what's this?",
            "*pounces on you* uwu you're so warm~",
            "*wags tail* hewwo fwiend! *nuzzles*",
            "*boops your snoot* uwu",
            "*twitches ears cutely* mmmm scritches? uwu",
            "*curls up on your lap* pwease pet me~",
            "*blushes and looks away shyly* uwu",
            "*offers you a cookie* uwu enjoy, fwiend!",
            "*flops over dramatically* pwease wub my bewwy"
        ]
        
        content = ctx.message.content[len(ctx.prefix) + len(ctx.invoked_with):].strip()
        
        if content:
            # UwU-ify the provided text
            uwu_text = self.uwuify(content)
            await ctx.send(uwu_text)
        else:
            # Send a random uwu response
            await ctx.send(random.choice(responses))
    
    def uwuify(self, text):
        """Convert text to uwu speak"""
        # Replace specific consonants
        text = text.replace('r', 'w').replace('l', 'w')
        text = text.replace('R', 'W').replace('L', 'W')
        
        # Replace specific words
        text = text.replace('the', 'da').replace('The', 'Da')
        text = text.replace('you', 'yuw').replace('You', 'Yuw')
        text = text.replace('my', 'mwy').replace('My', 'Mwy')
        
        # Add uwu faces randomly
        if len(text) > 0 and random.random() < 0.2:
            uwu_faces = [" uwu", " owo", " UwU", " OwO", " :3", " >w<", " ^w^"]
            text += random.choice(uwu_faces)
        
        # Add stuttering randomly
        words = text.split()
        for i in range(len(words)):
            if len(words[i]) > 0 and random.random() < 0.15:
                letter = words[i][0]
                words[i] = f"{letter}-{words[i]}"
        
        # Reassemble with extra uwuness
        result = ' '.join(words)
        if random.random() < 0.05:
            result += " *nuzzles*"
        if random.random() < 0.05:
            result += " *pounces*"
        
        return result
    
    @commands.command(name="choose", aliases=["pick"])
    async def choose(self, ctx, *, options):
        """Choose between multiple options.
        
        Example:
        >choose option1, option2, option3
        """
        options_list = [opt.strip() for opt in options.split(',')]
        
        if len(options_list) < 2:
            return await ctx.send("Please provide at least 2 options separated by commas.")
        
        chosen = random.choice(options_list)
        
        embed = discord.Embed(
            title="🤔 I choose...",
            description=f"**{chosen}**",
            color=0x9370DB
        )
        
        await ctx.send(embed=embed)
    
    @commands.command(name="8ball", aliases=["8b", "eightball"])
    async def eight_ball(self, ctx, *, question=None):
        """Ask the magic 8 ball a question.
        
        Example:
        >8ball Will I win the lottery?
        """
        if not question:
            return await ctx.send("Please ask a question!")
        
        responses = [
            # Positive answers
            "It is certain.",
            "It is decidedly so.",
            "Without a doubt.",
            "Yes, definitely.",
            "You may rely on it.",
            "As I see it, yes.",
            "Most likely.",
            "Outlook good.",
            "Yes.",
            "Signs point to yes.",
            
            # Neutral answers
            "Reply hazy, try again.",
            "Ask again later.",
            "Better not tell you now.",
            "Cannot predict now.",
            "Concentrate and ask again.",
            
            # Negative answers
            "Don't count on it.",
            "My reply is no.",
            "My sources say no.",
            "Outlook not so good.",
            "Very doubtful."
        ]
        
        response = random.choice(responses)
        
        embed = discord.Embed(
            title="🎱 Magic 8-Ball",
            color=0x9370DB
        )
        embed.add_field(name="Question", value=question, inline=False)
        embed.add_field(name="Answer", value=response, inline=False)
        
        await ctx.send(embed=embed)
    
    @commands.command(name="roll", aliases=["dice"])
    async def roll(self, ctx, dice="1d20"):
        """Roll dice in NdN format.
        
        Example:
        >roll - Rolls 1d20
        >roll 3d6 - Rolls 3 six-sided dice
        """
        try:
            # Parse dice format
            num_dice, dice_sides = dice.lower().split('d')
            
            if not num_dice:
                num_dice = 1
            
            num_dice = int(num_dice)
            dice_sides = int(dice_sides)
            
            # Limit to prevent abuse
            if num_dice < 1 or num_dice > 25:
                return await ctx.send("Number of dice must be between 1 and 25.")
            
            if dice_sides < 1 or dice_sides > 1000:
                return await ctx.send("Dice sides must be between 1 and 1000.")
            
            # Roll dice
            rolls = [random.randint(1, dice_sides) for _ in range(num_dice)]
            total = sum(rolls)
            
            # Format result
            if num_dice == 1:
                result = f"🎲 You rolled a **{total}**"
            else:
                roll_list = ", ".join(str(r) for r in rolls)
                result = f"🎲 You rolled: {roll_list}\nTotal: **{total}**"
            
            await ctx.send(result)
        
        except ValueError:
            await ctx.send("Invalid dice format. Use NdN format like `3d6`.")
    
    @commands.command(name="coin", aliases=["flip", "coinflip"])
    async def coinflip(self, ctx):
        """Flip a coin."""
        result = random.choice(["Heads", "Tails"])
        
        embed = discord.Embed(
            title="Coin Flip",
            description=f"The coin landed on... **{result}**!",
            color=0x9370DB
        )
        
        if result == "Heads":
            embed.set_thumbnail(url="https://i.imgur.com/HavOS7J.png")
        else:
            embed.set_thumbnail(url="https://i.imgur.com/u1pmQMV.png")
        
        await ctx.send(embed=embed)
    
    @commands.command(name="hug")
    async def hug(self, ctx, *, member: discord.Member = None):
        """Give someone a hug.
        
        Example:
        >hug @user
        """
        if member is None:
            return await ctx.send("Please specify someone to hug!")
        
        if member.id == ctx.author.id:
            return await ctx.send(f"*{ctx.author.display_name} hugs themselves...* Everything okay?")
        
        hug_gifs = [
            "https://c.tenor.com/GP5YPEMhdxsAAAAC/anime-cuddle.gif",
            "https://c.tenor.com/kmW49YqjgcYAAAAC/anime-hug.gif",
            "https://c.tenor.com/fGmJbYD_5MQAAAAC/hugging-anime.gif",
            "https://c.tenor.com/d0P4fWS3sMoAAAAC/anime-hug.gif",
            "https://c.tenor.com/SzVEJU3d7-AAAAAC/anime-head-pat.gif",
            "https://c.tenor.com/vCvJDxmKcz8AAAAC/anime-cute.gif"
        ]
        
        embed = discord.Embed(
            description=f"**{ctx.author.display_name}** hugs **{member.display_name}** 💕",
            color=0x9370DB
        )
        embed.set_image(url=random.choice(hug_gifs))
        
        await ctx.send(embed=embed)
    
    @commands.command(name="pat")
    async def pat(self, ctx, *, member: discord.Member = None):
        """Give someone a pat on the head.
        
        Example:
        >pat @user
        """
        if member is None:
            return await ctx.send("Please specify someone to pat!")
        
        if member.id == ctx.author.id:
            return await ctx.send(f"*{ctx.author.display_name} pats themselves...* That's... interesting.")
        
        pat_gifs = [
            "https://c.tenor.com/G7JkF7o8WIYAAAAC/anime-head-pat.gif",
            "https://c.tenor.com/nzV2fTmQrEMAAAAC/anime-pat.gif",
            "https://c.tenor.com/KpDR5N2vdWsAAAAC/anime-pat.gif",
            "https://c.tenor.com/e9lD_6AZFAwAAAAC/anime-head-pat.gif",
            "https://c.tenor.com/QAIyvfoK_9AAAAAC/anime-head-pat.gif",
            "https://c.tenor.com/qTLXF9XfCNAAAAAC/anime-pat.gif"
        ]
        
        embed = discord.Embed(
            description=f"**{ctx.author.display_name}** pats **{member.display_name}** on the head ✨",
            color=0x9370DB
        )
        embed.set_image(url=random.choice(pat_gifs))
        
        await ctx.send(embed=embed)
    
    @commands.command(name="avatar", aliases=["pfp"])
    async def avatar(self, ctx, *, member: discord.Member = None):
        """Display a user's avatar.
        
        Example:
        >avatar - Show your own avatar
        >avatar @user - Show someone else's avatar
        """
        member = member or ctx.author
        
        embed = discord.Embed(
            title=f"{member.display_name}'s Avatar",
            color=0x9370DB
        )
        
        # Add standard avatar
        embed.set_image(url=member.display_avatar.url)
        
        # Add server-specific avatar if different
        if hasattr(member, 'guild_avatar') and member.guild_avatar:
            embed.set_thumbnail(url=member.guild_avatar.url)
            embed.set_footer(text="Server Avatar shown as thumbnail")
            
        await ctx.send(embed=embed)

async def setup(bot):
    await bot.add_cog(Fun(bot))