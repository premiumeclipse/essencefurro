import {
  CloudLightning,
  Music,
  SmilePlus,
  Bell,
  BarChart2,
  Paintbrush
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: <CloudLightning className="h-6 w-6 text-white" />,
    title: "Advanced Moderation :3",
    description: "Paw-erful tools to keep your server safe and cozy. Ban, kick, mute, and more with customizable auto-mod features :3"
  },
  {
    icon: <Music className="h-6 w-6 text-white" />,
    title: "Music Player :3",
    description: "High-quality music playback from YouTube, Spotify, and SoundCloud for those furry dance parties! With playlist support and DJ controls :3"
  },
  {
    icon: <SmilePlus className="h-6 w-6 text-white" />,
    title: "Fun & Games :3",
    description: "Keep your furry friends entertained with memes, jokes, trivia, and mini-games that everyone can enjoy together :3"
  },
  {
    icon: <Bell className="h-6 w-6 text-white" />,
    title: "Custom Notifications :3",
    description: "Set up paw-some custom notifications for your server, including welcome messages, level-ups, and event announcements :3"
  },
  {
    icon: <BarChart2 className="h-6 w-6 text-white" />,
    title: "Server Analytics :3",
    description: "Get detailed insights into your server's activity, member engagement, and growth with easy-to-read charts and graphs :3"
  },
  {
    icon: <Paintbrush className="h-6 w-6 text-white" />,
    title: "Custom Themes :3",
    description: "Personalize your furry bot's appearance and responses with custom themes, colors, and message styles to match your fursona :3"
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 bg-gradient-to-b from-[#0f0f19] to-[#0d0d17]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Paw-some <span className="gradient-text">Features</span> :3
          </motion.h2>
          <motion.p 
            className="text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            essence comes packed with all the furry features you need to make your Discord server amazing :3
          </motion.p>
        </div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm rounded-xl p-6 border border-gray-800/40 flex flex-col h-full transition-all duration-300 card-gradient-hover hover:-translate-y-1 hover:shadow-lg hover:shadow-[#5865F2]/5"
              variants={item}
            >
              <div className="rounded-full bg-gradient-to-br from-white/10 to-gray-500/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-300 mb-4">
                {feature.description}
              </p>
              <div className="mt-auto">
                <a href="#commands" className="gradient-text hover:opacity-80 transition-opacity text-sm flex items-center">
                  Learn more
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
