import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section id="home" className="pt-24 pb-16 md:pt-32 md:pb-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <motion.div 
            className="md:w-1/2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Meet <span className="text-pink-500">essence</span>,<br/>
              your ultimate Discord companion
            </h1>
            <p className="text-gray-300 text-lg mb-8">
              Enhance your server with powerful moderation, fun commands, and music capabilities. 
              The all-in-one bot designed to elevate your Discord experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                className="bg-[#5865F2] hover:bg-[#4752c4] transition-transform hover:-translate-y-0.5 hover:shadow-lg"
                asChild
              >
                <a href="https://discord.com/api/oauth2/authorize" target="_blank" rel="noopener noreferrer">
                  Add to Discord
                </a>
              </Button>
              <Button 
                size="lg"
                variant="outline" 
                className="transition-transform hover:-translate-y-0.5 hover:shadow-lg"
                asChild
              >
                <a href="https://discord.gg/essencesupport" target="_blank" rel="noopener noreferrer">
                  Join Support Server
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
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-[#5865F2] rounded-lg blur opacity-30"></div>
              <div className="relative bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
                <div className="aspect-video bg-gray-800 flex items-center justify-center text-gray-600">
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
