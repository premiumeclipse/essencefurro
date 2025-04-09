import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type CommandCategory = "moderation" | "music" | "fun" | "utility" | "settings";

interface Command {
  name: string;
  description: string;
  usage: string;
  example: string;
}

const commands: Record<CommandCategory, Command[]> = {
  moderation: [
    {
      name: "/ban",
      description: "Bans a user from the server",
      usage: "/ban @user [reason] [delete_days]",
      example: "/ban @user Spamming in chat 7"
    },
    {
      name: "/kick",
      description: "Kicks a user from the server",
      usage: "/kick @user [reason]",
      example: "/kick @user Breaking server rules"
    },
    {
      name: "/mute",
      description: "Mutes a user for a specified time",
      usage: "/mute @user duration [reason]",
      example: "/mute @user 1h Excessive caps"
    },
    {
      name: "/warn",
      description: "Issues a warning to a user",
      usage: "/warn @user reason",
      example: "/warn @user Inappropriate language"
    },
    {
      name: "/clear",
      description: "Clears messages from a channel",
      usage: "/clear amount [user]",
      example: "/clear 50 @user"
    }
  ],
  music: [
    {
      name: "/play",
      description: "Plays a song or adds it to the queue",
      usage: "/play song_name or URL",
      example: "/play Never Gonna Give You Up"
    },
    {
      name: "/skip",
      description: "Skips the current song",
      usage: "/skip",
      example: "/skip"
    },
    {
      name: "/queue",
      description: "Shows the current music queue",
      usage: "/queue [page]",
      example: "/queue 2"
    },
    {
      name: "/volume",
      description: "Adjusts the volume of the music",
      usage: "/volume level",
      example: "/volume 75"
    },
    {
      name: "/stop",
      description: "Stops the music and clears the queue",
      usage: "/stop",
      example: "/stop"
    }
  ],
  fun: [
    {
      name: "/meme",
      description: "Sends a random meme",
      usage: "/meme [category]",
      example: "/meme dank"
    },
    {
      name: "/trivia",
      description: "Starts a trivia game",
      usage: "/trivia [category] [difficulty]",
      example: "/trivia gaming medium"
    },
    {
      name: "/8ball",
      description: "Ask the magic 8ball a question",
      usage: "/8ball question",
      example: "/8ball Will I win the lottery?"
    },
    {
      name: "/joke",
      description: "Tells a random joke",
      usage: "/joke [category]",
      example: "/joke dad"
    },
    {
      name: "/emoji",
      description: "Displays a large version of an emoji",
      usage: "/emoji emoji",
      example: "/emoji 😂"
    }
  ],
  utility: [
    {
      name: "/info",
      description: "Shows info about a user",
      usage: "/info [@user]",
      example: "/info @user"
    },
    {
      name: "/serverinfo",
      description: "Shows info about the server",
      usage: "/serverinfo",
      example: "/serverinfo"
    },
    {
      name: "/avatar",
      description: "Shows a user's avatar",
      usage: "/avatar [@user]",
      example: "/avatar @user"
    },
    {
      name: "/poll",
      description: "Creates a poll",
      usage: "/poll question option1 option2 ...",
      example: "/poll \"Pizza or Burgers?\" Pizza Burgers"
    },
    {
      name: "/remind",
      description: "Sets a reminder",
      usage: "/remind time message",
      example: "/remind 3h Check the oven"
    }
  ],
  settings: [
    {
      name: "/prefix",
      description: "Changes the bot prefix",
      usage: "/prefix new_prefix",
      example: "/prefix !"
    },
    {
      name: "/welcome",
      description: "Sets up welcome messages",
      usage: "/welcome channel #channel message",
      example: "/welcome channel #welcome Hello {user}!"
    },
    {
      name: "/autorole",
      description: "Sets up automatic role assignment",
      usage: "/autorole add/remove @role",
      example: "/autorole add @Member"
    },
    {
      name: "/logs",
      description: "Sets up server logs",
      usage: "/logs channel #channel",
      example: "/logs channel #server-logs"
    },
    {
      name: "/levelup",
      description: "Configures level-up notifications",
      usage: "/levelup channel #channel",
      example: "/levelup channel #achievements"
    }
  ]
};

export function CommandsSection() {
  const [activeCategory, setActiveCategory] = useState<CommandCategory>("moderation");

  return (
    <section id="commands" className="py-16 hero-gradient">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <span className="gradient-text">Commands</span> List
          </motion.h2>
          <motion.p 
            className="text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Explore all the paw-some commands essence has to offer for your furry Discord server
          </motion.p>
        </div>
        
        <motion.div 
          className="bg-gradient-to-br from-gray-900/80 to-black/90 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-800/40 shadow-xl shadow-black/20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          {/* Command Category Tabs */}
          <div className="flex overflow-x-auto border-b border-gray-800/50">
            {(Object.keys(commands) as CommandCategory[]).map((category) => (
              <button
                key={category}
                className={cn(
                  "px-6 py-4 font-medium whitespace-nowrap transition-all duration-200",
                  activeCategory === category
                    ? "bg-gradient-to-r from-white to-gray-500 text-black"
                    : "bg-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                )}
                onClick={() => setActiveCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
          
          {/* Command Lists */}
          <div className="command-content">
            {commands[activeCategory].map((command, index) => (
              <div 
                key={index} 
                className={cn(
                  "p-4 flex flex-col md:flex-row md:items-center transition-all duration-200 card-gradient-hover",
                  index !== commands[activeCategory].length - 1 && "border-b border-gray-800/30"
                )}
              >
                <div className="md:w-1/3">
                  <h4 className="text-lg font-semibold text-white">{command.name}</h4>
                  <p className="text-gray-400 text-sm">{command.description}</p>
                </div>
                <div className="md:w-2/3 mt-2 md:mt-0">
                  <p className="text-gray-300">
                    <span className="gradient-text font-semibold">{command.name}</span>{" "}
                    {command.usage.slice(command.name.length).split(" ").map((part, i) => {
                      if (part.startsWith("[") && part.endsWith("]")) {
                        return <span key={i} className="text-gray-400 italic">{part} </span>;
                      }
                      return <span key={i} className="text-white">{part} </span>;
                    })}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">Example: {command.example}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
