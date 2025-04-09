import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function CTASection() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#5865F2]/20 to-pink-500/20 opacity-30"></div>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to enhance your Discord server?
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Join thousands of servers already using essence to take their Discord experience to the next level.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg"
              className="bg-[#5865F2] hover:bg-[#4752c4] transition-transform hover:-translate-y-0.5 hover:shadow-lg"
              asChild
            >
              <a href="https://discord.com/api/oauth2/authorize" target="_blank" rel="noopener noreferrer">
                Add essence to Discord
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
      </div>
    </section>
  );
}
