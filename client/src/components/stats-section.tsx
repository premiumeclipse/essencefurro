import { useQuery } from "@tanstack/react-query";
import { Counter } from "@/components/ui/counter";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import type { BotStats } from "@shared/schema";

export function StatsSection() {
  const { data: stats, isLoading } = useQuery<BotStats>({
    queryKey: ["/api/stats"],
  });

  const statItems = [
    {
      label: "Servers",
      value: stats?.servers || 0,
    },
    {
      label: "Users",
      value: stats?.users || 0,
    },
    {
      label: "Commands Run",
      value: stats?.commandsRun || 0,
    },
    {
      label: "Uptime %",
      value: stats?.uptime || 0,
    },
  ];

  return (
    <section id="stats" className="py-16 bg-gradient-to-b from-[#0d0d17] to-[#0f0f19]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Bot <span className="gradient-text">Statistics</span>
          </motion.h2>
          <motion.p 
            className="text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            See how essence is making an impact across Discord.
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {statItems.map((item, index) => (
            <motion.div
              key={index}
              className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm rounded-xl p-6 border border-gray-800/40 text-center transition-all hover:shadow-lg hover:shadow-[#5865F2]/5 hover:scale-105 duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              {isLoading ? (
                <Skeleton className="h-12 w-1/2 mx-auto mb-2" />
              ) : (
                <Counter value={item.value} className="gradient-text" />
              )}
              <p className="text-gray-300 mt-2 font-medium">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
