import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";

export default function ThankYou() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="container max-w-3xl mx-auto">
        <motion.div 
          className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm rounded-xl p-8 md:p-12 border border-gray-800/40 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="mx-auto rounded-full bg-gradient-to-br from-white/10 to-gray-500/10 p-4 w-20 h-20 flex items-center justify-center mb-6"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Check className="h-10 w-10 text-white" />
          </motion.div>
          
          <motion.h1 
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <span className="gradient-text">Thank You</span> for Adding essence! :3
          </motion.h1>
          
          <motion.p 
            className="text-gray-300 text-lg mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            The furry bot has been successfully added to your Discord server :3 You can now start using all the paw-some features and commands to enhance your server experience!
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <p className="text-gray-400 mb-8">
              Use <code className="bg-black px-2 py-1 rounded">/help</code> in your server to see all available commands :3
            </p>
            
            <Button 
              size="lg"
              className="bg-gradient-to-r from-white to-gray-300 hover:bg-gradient-to-r hover:from-gray-300 hover:to-gray-400 text-black border-none transition-transform hover:-translate-y-0.5 hover:shadow-lg"
              asChild
            >
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> Return to Homepage :3
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}