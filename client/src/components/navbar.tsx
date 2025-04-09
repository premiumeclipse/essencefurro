import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-md z-50 border-b border-gray-800/50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold text-white flex items-center">
            <span className="gradient-text">e</span>ssence
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-gray-300 hover:text-white hover:scale-105 transition-all">
              Home
            </a>
            <a href="#features" className="text-gray-300 hover:text-white hover:scale-105 transition-all">
              Features
            </a>
            <a href="#commands" className="text-gray-300 hover:text-white hover:scale-105 transition-all">
              Commands
            </a>
            <a href="#stats" className="text-gray-300 hover:text-white hover:scale-105 transition-all">
              Stats
            </a>
            <div className="flex space-x-4">
              <Button 
                className="bg-gradient-to-r from-[#5865F2] to-[#4752c4] hover:bg-gradient-to-r hover:from-[#4752c4] hover:to-[#3a44b1] border-none transition-transform hover:-translate-y-0.5 hover:shadow-lg"
                asChild
              >
                <a href="https://discord.com/api/oauth2/authorize" target="_blank" rel="noopener noreferrer">
                  Add Bot
                </a>
              </Button>
              <Button 
                variant="outline" 
                className="gradient-border transition-transform hover:-translate-y-0.5 hover:shadow-lg"
                asChild
              >
                <a href="https://discord.gg/essencesupport" target="_blank" rel="noopener noreferrer">
                  Join Server
                </a>
              </Button>
            </div>
          </nav>
          
          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-gray-300 hover:text-white"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
        
        {/* Mobile Navigation */}
        <div className={cn("md:hidden pb-4", isMenuOpen ? "block" : "hidden")}>
          <div className="flex flex-col space-y-4">
            <a 
              href="#home" 
              className="text-gray-300 hover:text-white transition-colors py-2"
              onClick={toggleMenu}
            >
              Home
            </a>
            <a 
              href="#features" 
              className="text-gray-300 hover:text-white transition-colors py-2"
              onClick={toggleMenu}
            >
              Features
            </a>
            <a 
              href="#commands" 
              className="text-gray-300 hover:text-white transition-colors py-2"
              onClick={toggleMenu}
            >
              Commands
            </a>
            <a 
              href="#stats" 
              className="text-gray-300 hover:text-white transition-colors py-2"
              onClick={toggleMenu}
            >
              Stats
            </a>
            <div className="flex flex-col space-y-3 pt-2">
              <Button 
                className="bg-gradient-to-r from-[#5865F2] to-[#4752c4] hover:bg-gradient-to-r hover:from-[#4752c4] hover:to-[#3a44b1] border-none transition-transform hover:-translate-y-0.5 hover:shadow-lg w-full"
                asChild
              >
                <a href="https://discord.com/api/oauth2/authorize" target="_blank" rel="noopener noreferrer">
                  Add Bot
                </a>
              </Button>
              <Button 
                variant="outline" 
                className="gradient-border transition-transform hover:-translate-y-0.5 hover:shadow-lg w-full"
                asChild
              >
                <a href="https://discord.gg/essencesupport" target="_blank" rel="noopener noreferrer">
                  Join Server
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
