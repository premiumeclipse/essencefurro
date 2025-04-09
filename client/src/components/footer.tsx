import { Link } from "wouter";
import { DiscordIcon, GitHubIcon, TwitterIcon } from "@/components/ui/discord-icon";

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-black to-[#0a0a14] py-12 border-t border-gray-800/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-8 md:mb-0">
            <Link href="/" className="text-2xl font-bold text-white flex items-center">
              <span className="gradient-text">e</span>ssence
            </Link>
            <p className="text-gray-400 mt-2">
              The ultimate Discord companion bot
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Navigation</h3>
              <ul className="space-y-2">
                <li><a href="#home" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all inline-block">Home</a></li>
                <li><a href="#features" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all inline-block">Features</a></li>
                <li><a href="#commands" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all inline-block">Commands</a></li>
                <li><a href="#stats" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all inline-block">Stats</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all inline-block">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all inline-block">Support</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all inline-block">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all inline-block">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-white font-semibold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <a href="https://discord.gg/essencesupport" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#5865F2] transition-colors hover:scale-110 transform">
                  <DiscordIcon />
                </a>
                <a href="https://github.com/essence-bot" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors hover:scale-110 transform">
                  <GitHubIcon />
                </a>
                <a href="https://twitter.com/essencebot" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500 transition-colors hover:scale-110 transform">
                  <TwitterIcon />
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-800/50 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} <span className="gradient-text">essence</span> bot. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
