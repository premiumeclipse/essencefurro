import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, CheckCircle, AlertOctagon, Eye, Search, Shield, Clock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from "@/hooks/use-toast";
import { z } from 'zod';

type IncidentType = {
  id: number;
  title: string;
  description: string;
  status: string;
  type: string;
  timestamp: string;
  public: boolean;
};

export function StatusSection() {
  const [incidents, setIncidents] = useState<IncidentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallStatus, setOverallStatus] = useState<'operational' | 'degraded' | 'critical'>('operational');

  // Fetch incidents
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setLoading(true);
        console.log('Fetching public incidents...');
        
        // Check if we're in production (Netlify) or development
        const isProduction = import.meta.env.PROD;
        const url = isProduction ? '/.netlify/functions/incidents' : '/api/incidents';
        
        const response = await fetch(url);
        console.log('Incidents response status:', response.status);
        
        let data = [];
        try {
          data = await response.json();
          console.log('Fetched incidents data:', data);
          setIncidents(data);
          
          // Set overall status based on incidents
          if (data.some((inc: IncidentType) => inc.type === 'red' && inc.status !== 'resolved')) {
            setOverallStatus('critical');
          } else if (data.some((inc: IncidentType) => (inc.type === 'yellow' || inc.type === 'orange') && inc.status !== 'resolved')) {
            setOverallStatus('degraded');
          } else {
            setOverallStatus('operational');
          }
        } catch (parseError) {
          console.error('Error parsing incidents response:', parseError);
          try {
            const textResponse = await response.text();
            console.log('Raw incidents response:', textResponse);
          } catch (e) {
            console.error('Could not get raw response text:', e);
          }
        }
      } catch (error) {
        console.error('Failed to fetch incidents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
    
    // Refresh incidents every 60 seconds
    const intervalId = setInterval(fetchIncidents, 60000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <section className="py-16 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-2">System Status</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Current status of the essence bot and its services
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <Card className="bg-gradient-to-br from-gray-900/80 to-black/90 backdrop-blur-sm border border-gray-800/40 shadow-xl shadow-black/20 mb-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-xl">System Status</CardTitle>
                <CardDescription>Current operational status of essence bot</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                {overallStatus === 'operational' && (
                  <Badge variant="outline" className="bg-green-500/20 text-green-300 hover:bg-green-500/30 border-green-500/50 px-3 py-1">
                    <CheckCircle className="h-4 w-4 mr-2" /> All Systems Operational
                  </Badge>
                )}
                {overallStatus === 'degraded' && (
                  <Badge variant="outline" className="bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 border-yellow-500/50 px-3 py-1">
                    <AlertTriangle className="h-4 w-4 mr-2" /> Service Degradation
                  </Badge>
                )}
                {overallStatus === 'critical' && (
                  <Badge variant="outline" className="bg-red-500/20 text-red-300 hover:bg-red-500/30 border-red-500/50 px-3 py-1">
                    <AlertOctagon className="h-4 w-4 mr-2" /> Major Service Outage
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-16">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-700 rounded w-32 mx-auto"></div>
                    <div className="h-2 bg-gray-700 rounded w-48 mx-auto"></div>
                    <div className="h-2 bg-gray-700 rounded w-40 mx-auto"></div>
                  </div>
                </div>
              ) : incidents.length > 0 ? (
                <div className="space-y-4">
                  {incidents.map(incident => (
                    <div 
                      key={incident.id} 
                      className={`rounded-lg ${
                        incident.type === 'yellow' ? 'bg-yellow-500/10 border-yellow-500/30' :
                        incident.type === 'green' ? 'bg-green-500/10 border-green-500/30' :
                        incident.type === 'red' ? 'bg-red-500/10 border-red-500/30' :
                        incident.type === 'blue' ? 'bg-blue-500/10 border-blue-500/30' :
                        incident.type === 'orange' ? 'bg-orange-500/10 border-orange-500/30' :
                        'bg-gray-500/10 border-gray-500/30'
                      } border p-4`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          {incident.type === 'yellow' && <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />}
                          {incident.type === 'green' && <CheckCircle className="h-5 w-5 text-green-500 mr-2" />}
                          {incident.type === 'red' && <AlertOctagon className="h-5 w-5 text-red-500 mr-2" />}
                          {incident.type === 'blue' && <Eye className="h-5 w-5 text-blue-500 mr-2" />}
                          {incident.type === 'orange' && <Search className="h-5 w-5 text-orange-500 mr-2" />}
                          <h4 className={`font-semibold ${
                            incident.type === 'yellow' ? 'text-yellow-300' :
                            incident.type === 'green' ? 'text-green-300' :
                            incident.type === 'red' ? 'text-red-300' :
                            incident.type === 'blue' ? 'text-blue-300' :
                            incident.type === 'orange' ? 'text-orange-300' :
                            'text-gray-300'
                          }`}>{incident.title}</h4>
                        </div>
                        <Badge variant="outline" className={`
                          ${incident.type === 'yellow' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' :
                            incident.type === 'green' ? 'bg-green-500/20 text-green-300 border-green-500/50' :
                            incident.type === 'red' ? 'bg-red-500/20 text-red-300 border-red-500/50' :
                            incident.type === 'blue' ? 'bg-blue-500/20 text-blue-300 border-blue-500/50' :
                            incident.type === 'orange' ? 'bg-orange-500/20 text-orange-300 border-orange-500/50' :
                            'bg-gray-500/20 text-gray-300 border-gray-500/50'
                          }`
                        }>
                          {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{incident.description}</p>
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {incident.status === 'resolved' ? 'Resolved: ' : 'Started: '}{incident.timestamp}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Shield className="h-12 w-12 mx-auto text-green-500 mb-3 opacity-50" />
                  <p className="text-gray-300 font-medium">All Systems Operational</p>
                  <p className="text-gray-500 text-sm mt-1">No incidents reported in the last 24 hours</p>
                </div>
              )}
              
              <div className="flex items-center justify-center mt-6">
                <span className="text-xs text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" /> Last checked: {new Date().toLocaleTimeString()}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <div className="text-center">
            <a 
              href="/dev-tools" 
              className="text-gray-400 hover:text-white text-sm inline-flex items-center transition-colors"
            >
              <Shield className="h-4 w-4 mr-1" /> 
              View status page (Dev Tools)
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}