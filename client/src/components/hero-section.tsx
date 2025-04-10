import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section id="home" className="pt-24 pb-16 md:pt-32 md:pb-24 hero-gradient">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <motion.div 
            className="md:w-1/2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Meet <span className="gradient-text">essence</span><br/>
              your furry Discord companion
            </h1>
            <p className="text-gray-300 text-lg mb-8">
              Welcome essence to your server! Your all in one furro bot :3<br/>
              Enhance your server with powerful moderation, fun commands, and music capabilities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-white to-gray-300 hover:bg-gradient-to-r hover:from-gray-300 hover:to-gray-400 text-black border-none transition-transform hover:-translate-y-0.5 hover:shadow-lg"
                asChild
              >
                <a href="https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands&redirect_uri=https://YOUR_DOMAIN/thank-you" target="_blank" rel="noopener noreferrer">
                  Add to Discord
                </a>
              </Button>

            </div>
          </motion.div>
          <motion.div 
            className="md:w-1/2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-white via-gray-500 to-white rounded-lg blur opacity-20 animate-pulse"></div>
              <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-700/50">
                <div className="aspect-video bg-gradient-to-br from-gray-800/80 to-gray-900/80 flex items-center justify-center text-gray-600">
                  <svg className="w-24 h-24 opacity-30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
