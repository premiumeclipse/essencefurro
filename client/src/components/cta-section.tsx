import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function CTASection() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-gray-500/20 opacity-30"></div>
      <div className="absolute inset-0 backdrop-blur-[100px]"></div>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to <span className="gradient-text">enhance</span> your Discord server?
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Join thousands of furry servers already using essence to take their Discord experience to the next level
          </p>
          <div className="flex justify-center">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-white to-gray-300 hover:bg-gradient-to-r hover:from-gray-300 hover:to-gray-400 text-black border-none transition-transform hover:-translate-y-0.5 hover:shadow-lg shadow-lg shadow-white/20"
              asChild
            >
              <a href="https://discord.com/oauth2/authorize?client_id=1358670250799005797&permissions=27497939970230&response_type=code&redirect_uri=https%3A%2F%2Fessencedsc.netlify.app%2Fthank-you&integration_type=0&scope=identify+bot+applications.commands" target="_blank" rel="noopener noreferrer">
                Add essence to Discord
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
