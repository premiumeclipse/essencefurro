import { Link } from "wouter";
import { DiscordIcon, GitHubIcon, TwitterIcon } from "@/components/ui/discord-icon";

export function Footer() {
  return (
    <footer className="bg-black py-12 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-8 md:mb-0">
            <Link href="/" className="text-2xl font-bold text-white flex items-center">
              <span className="text-pink-500">e</span>ssence
            </Link>
            <p className="text-gray-400 mt-2">
              The ultimate Discord companion bot
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Navigation</h3>
              <ul className="space-y-2">
                <li><a href="#home" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#commands" className="text-gray-400 hover:text-white transition-colors">Commands</a></li>
                <li><a href="#stats" className="text-gray-400 hover:text-white transition-colors">Stats</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-white font-semibold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <a href="https://discord.gg/essencesupport" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <DiscordIcon />
                </a>
                <a href="https://github.com/essence-bot" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <GitHubIcon />
                </a>
                <a href="https://twitter.com/essencebot" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <TwitterIcon />
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} essence bot. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
