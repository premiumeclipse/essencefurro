import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  ArrowLeft, Server, User, Bot, Code, ShieldAlert, Activity, AlertTriangle, 
  CheckCircle, RefreshCw, PlusSquare, AlertOctagon, Eye, Search, ChevronDown 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';

export default function DevTools() {
  const [location, setLocation] = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState({
    servers: 5000,
    users: 1500000,
    commandsRun: 25000000,
  });
  const [systemStatus, setSystemStatus] = useState({
    botCore: { status: 'operational', indicator: 'green' },
    discordGateway: { status: 'connected', indicator: 'green' },
    database: { status: 'degraded', indicator: 'yellow' },
    apiEndpoints: { status: 'operational', indicator: 'green' },
    commandProcessing: { status: 'operational', indicator: 'green' },
  });
  const [incidents, setIncidents] = useState([
    {
      id: 1,
      title: 'Database Connection Issues',
      description: 'Intermittent database connection issues affecting some user profile operations.',
      status: 'investigating',
      type: 'yellow',
      timestamp: 'April 9, 2025 - 03:25 AM UTC',
      public: true
    },
    {
      id: 2,
      title: 'API Rate Limiting Resolved',
      description: 'Previously experienced Discord API rate limiting issues have been resolved.',
      status: 'resolved',
      type: 'green',
      timestamp: 'April 9, 2025 - 02:15 AM UTC',
      public: true
    }
  ]);
  const [newIncident, setNewIncident] = useState({
    title: '',
    description: '',
    status: 'investigating',
    type: 'yellow',
    public: true
  });
  const [systemLogs, setSystemLogs] = useState(`[2025-04-09 03:27:15] [ERROR] Database connection failed: timeout after 5000ms
[2025-04-09 03:27:20] [WARN] Reconnecting to database (attempt 1 of 5)
[2025-04-09 03:27:25] [INFO] Database connection established
[2025-04-09 03:30:10] [ERROR] Failed to fetch user profile: user_id=283719
[2025-04-09 03:32:45] [INFO] Guild join: Fresh Cats (ID: 782139)
[2025-04-09 03:35:12] [INFO] Command executed: >purge 15 (guild: 782139, user: 471582)
[2025-04-09 03:40:35] [WARN] Rate limit approaching for API route /guilds/123456/members
[2025-04-09 03:45:18] [INFO] Scheduled task completed: message cleanup`);
  const [logLevel, setLogLevel] = useState('error');

  const handleLogin = () => {
    if (password === 'essence@2025furry') {
      setIsAuthorized(true);
      toast({
        title: 'Access Granted',
        description: 'Welcome to essence developer tools',
        variant: 'default',
      });
    } else {
      toast({
        title: 'Access Denied',
        description: 'Invalid password provided',
        variant: 'destructive',
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };
  
  const refreshSystemStatus = () => {
    // In a real app, this would fetch the latest system status from an API
    toast({
      title: 'Status Refreshed',
      description: 'System status has been updated',
      variant: 'default',
    });
  };
  
  const refreshLogs = () => {
    // In a real app, this would fetch the latest logs from an API
    const newLogEntry = `[2025-04-09 ${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}:${new Date().getSeconds().toString().padStart(2, '0')}] [INFO] Log refresh requested by admin`;
    setSystemLogs(prevLogs => newLogEntry + '\n' + prevLogs);
    
    toast({
      title: 'Logs Refreshed',
      description: 'System logs have been updated',
      variant: 'default',
    });
  };
  
  const handleNewIncident = async () => {
    if (!newIncident.title || !newIncident.description) {
      toast({
        title: 'Validation Error',
        description: 'Please provide both a title and description for the incident',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const response = await apiRequest('POST', '/api/incidents', newIncident);
      
      if (response.ok) {
        const createdIncident = await response.json();
        
        // Update the local state with the new incident from the server
        setIncidents(prev => [createdIncident, ...prev]);
        
        // Reset the form
        setNewIncident({
          title: '',
          description: '',
          status: 'investigating',
          type: 'yellow',
          public: true
        });
        
        // Add to logs
        const newLogEntry = `[2025-04-09 ${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}:${new Date().getSeconds().toString().padStart(2, '0')}] [INFO] New incident created: ${createdIncident.title}`;
        setSystemLogs(prevLogs => newLogEntry + '\n' + prevLogs);
        
        toast({
          title: 'Incident Created',
          description: 'New incident has been added to the status page',
          variant: 'default',
        });
      } else {
        throw new Error('Failed to create incident');
      }
    } catch (error) {
      console.error('Error creating incident:', error);
      toast({
        title: 'Error',
        description: 'Failed to create the incident. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const updateIncidentStatus = async (id: number, newStatus: string, newType: string) => {
    try {
      const response = await apiRequest('PATCH', `/api/incidents/${id}`, {
        status: newStatus,
        type: newType
      });
      
      if (response.ok) {
        const updatedIncident = await response.json();
        
        setIncidents(prev => 
          prev.map(incident => 
            incident.id === id ? updatedIncident : incident
          )
        );
        
        // Add to logs
        const incidentTitle = incidents.find(inc => inc.id === id)?.title || 'Unknown incident';
        const newLogEntry = `[2025-04-09 ${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}:${new Date().getSeconds().toString().padStart(2, '0')}] [INFO] Incident status updated: ${incidentTitle} -> ${newStatus}`;
        setSystemLogs(prevLogs => newLogEntry + '\n' + prevLogs);
        
        toast({
          title: 'Incident Updated',
          description: `Incident status changed to "${newStatus}"`,
          variant: 'default',
        });
      } else {
        throw new Error('Failed to update incident');
      }
    } catch (error) {
      console.error('Error updating incident:', error);
      toast({
        title: 'Update Failed',
        description: 'Could not update incident status',
        variant: 'destructive',
      });
    }
  };

  const updateStats = async (field: string, value: number) => {
    try {
      const response = await apiRequest('POST', '/api/stats', { 
        [field]: value 
      });
      
      if (response.ok) {
        setStats(prev => ({ ...prev, [field]: value }));
        toast({
          title: 'Stats Updated',
          description: `${field} value has been updated to ${value}`,
          variant: 'default',
        });
      }
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Could not update stats',
        variant: 'destructive',
      });
    }
  };

  // Fetch the incidents
  useEffect(() => {
    if (isAuthorized) {
      const fetchIncidents = async () => {
        try {
          const response = await apiRequest('GET', '/api/incidents/all');
          if (response.ok) {
            const data = await response.json();
            setIncidents(data);
          }
        } catch (error) {
          console.error('Failed to fetch incidents:', error);
        }
      };
      
      fetchIncidents();
    }
  }, [isAuthorized]);
  
  // Fetch the current stats
  useEffect(() => {
    if (isAuthorized) {
      const fetchStats = async () => {
        try {
          const response = await apiRequest('GET', '/api/stats');
          if (response.ok) {
            const data = await response.json();
            setStats({
              servers: data.servers,
              users: data.users,
              commandsRun: data.commandsRun,
            });
          }
        } catch (error) {
          console.error('Failed to fetch stats:', error);
        }
      };
      
      fetchStats();
    }
  }, [isAuthorized]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
        <motion.div 
          className="w-full max-w-md bg-gradient-to-br from-gray-900/80 to-black/90 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-800/40 shadow-xl shadow-black/20 p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-6">
            <motion.h2 
              className="text-2xl md:text-3xl font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="gradient-text">Developer</span> Tools
            </motion.h2>
            <motion.p 
              className="text-gray-400 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Enter password to continue
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="space-y-4">
              <Input 
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-gray-900/50 border-gray-700"
              />
              <Button 
                className="w-full bg-gradient-to-r from-white to-gray-300 hover:from-gray-300 hover:to-gray-400 text-black"
                onClick={handleLogin}
              >
                Login
              </Button>
              <div className="pt-2">
                <Button 
                  variant="link" 
                  className="text-gray-500 hover:text-gray-300"
                  asChild
                >
                  <Link href="/">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Return to Homepage
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hero-gradient p-4 py-16">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <motion.h1 
            className="text-3xl font-bold"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="gradient-text">essence</span> Dev Tools
          </motion.h1>
          <Button 
            variant="outline" 
            className="border-gray-700 hover:bg-gray-800"
            asChild
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-1" /> Return to Homepage
            </Link>
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs defaultValue="status" className="w-full">
            <TabsList className="bg-gray-900/50 border border-gray-800 mb-6">
              <TabsTrigger value="status" className="data-[state=active]:bg-white data-[state=active]:text-black">
                <AlertTriangle className="h-4 w-4 mr-2" /> Status
              </TabsTrigger>
              <TabsTrigger value="statistics" className="data-[state=active]:bg-white data-[state=active]:text-black">
                <Activity className="h-4 w-4 mr-2" /> Statistics
              </TabsTrigger>
              <TabsTrigger value="servers" className="data-[state=active]:bg-white data-[state=active]:text-black">
                <Server className="h-4 w-4 mr-2" /> Servers
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-white data-[state=active]:text-black">
                <User className="h-4 w-4 mr-2" /> Users
              </TabsTrigger>
              <TabsTrigger value="commands" className="data-[state=active]:bg-white data-[state=active]:text-black">
                <Code className="h-4 w-4 mr-2" /> Commands
              </TabsTrigger>
              <TabsTrigger value="logs" className="data-[state=active]:bg-white data-[state=active]:text-black">
                <ShieldAlert className="h-4 w-4 mr-2" /> Logs
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="status" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-gray-900/80 to-black/90 backdrop-blur-sm border-gray-800/40 shadow-xl shadow-black/20">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Bot Status Overview</CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-gray-700 hover:bg-gray-800"
                        onClick={refreshSystemStatus}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" /> Refresh
                      </Button>
                    </div>
                    <CardDescription>Current operational status of all bot services</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          <span>Bot Core</span>
                        </div>
                        <Badge variant="outline" className="bg-green-500/20 text-green-300 hover:bg-green-500/30 border-green-500/50">Operational</Badge>
                      </div>
                      <Separator className="bg-gray-800" />
                      
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          <span>Discord Gateway</span>
                        </div>
                        <Badge variant="outline" className="bg-green-500/20 text-green-300 hover:bg-green-500/30 border-green-500/50">Connected</Badge>
                      </div>
                      <Separator className="bg-gray-800" />
                      
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center">
                          <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                          <span>Database Services</span>
                        </div>
                        <Badge variant="outline" className="bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 border-yellow-500/50">Degraded</Badge>
                      </div>
                      <Separator className="bg-gray-800" />
                      
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          <span>API Endpoints</span>
                        </div>
                        <Badge variant="outline" className="bg-green-500/20 text-green-300 hover:bg-green-500/30 border-green-500/50">Operational</Badge>
                      </div>
                      <Separator className="bg-gray-800" />
                      
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          <span>Command Processing</span>
                        </div>
                        <Badge variant="outline" className="bg-green-500/20 text-green-300 hover:bg-green-500/30 border-green-500/50">Operational</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-gray-900/80 to-black/90 backdrop-blur-sm border-gray-800/40 shadow-xl shadow-black/20">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Active Incidents</CardTitle>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" className="bg-gradient-to-r from-white to-gray-300 hover:from-gray-300 hover:to-gray-400 text-black">
                            <PlusSquare className="h-4 w-4 mr-1" /> Report Incident
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-sm border border-gray-800/40 shadow-xl shadow-black/20">
                          <DialogHeader>
                            <DialogTitle>Create New Incident Report</DialogTitle>
                            <DialogDescription>
                              Report a new service incident to notify users
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="incident-title">Incident Title</Label>
                              <Input 
                                id="incident-title" 
                                placeholder="e.g. API Service Disruption" 
                                className="bg-gray-900/50 border-gray-700"
                                value={newIncident.title}
                                onChange={(e) => setNewIncident({...newIncident, title: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="incident-description">Description</Label>
                              <Textarea 
                                id="incident-description" 
                                placeholder="Describe the issue in detail..." 
                                className="bg-gray-900/50 border-gray-700 min-h-[100px]"
                                value={newIncident.description}
                                onChange={(e) => setNewIncident({...newIncident, description: e.target.value})}
                              />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="incident-status">Status</Label>
                                <select 
                                  id="incident-status" 
                                  className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1.5"
                                  value={newIncident.status}
                                  onChange={(e) => {
                                    const status = e.target.value;
                                    let type = newIncident.type;
                                    
                                    // Automatically update type based on status
                                    if (status === 'investigating') type = 'yellow';
                                    else if (status === 'identified') type = 'orange';
                                    else if (status === 'monitoring') type = 'blue';
                                    else if (status === 'resolved') type = 'green';
                                    else if (status === 'critical') type = 'red';
                                    
                                    setNewIncident({...newIncident, status, type});
                                  }}
                                >
                                  <option value="investigating">Investigating</option>
                                  <option value="identified">Identified</option>
                                  <option value="monitoring">Monitoring</option>
                                  <option value="critical">Critical</option>
                                  <option value="resolved">Resolved</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="incident-visibility">Visibility</Label>
                                <div className="flex items-center space-x-2 h-9 pt-2">
                                  <Switch 
                                    id="incident-public" 
                                    checked={newIncident.public}
                                    onCheckedChange={(checked) => setNewIncident({...newIncident, public: checked})}
                                  />
                                  <Label htmlFor="incident-public" className="text-sm text-gray-400">
                                    Make publicly visible
                                  </Label>
                                </div>
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button 
                              variant="outline" 
                              className="border-gray-700 hover:bg-gray-800"
                              onClick={() => {
                                setNewIncident({
                                  title: '',
                                  description: '',
                                  status: 'investigating',
                                  type: 'yellow',
                                  public: true
                                });
                              }}
                            >
                              Cancel
                            </Button>
                            <Button 
                              className="bg-gradient-to-r from-white to-gray-300 hover:from-gray-300 hover:to-gray-400 text-black"
                              onClick={handleNewIncident}
                            >
                              Create Report
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <CardDescription>Current issues affecting the bot</CardDescription>
                  </CardHeader>
                  <CardContent className="max-h-[400px] overflow-y-auto">
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
                        } border p-4 mb-4 last:mb-0`}
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
                          <div className="flex items-center space-x-2">
                            {incident.public && (
                              <Badge variant="outline" className="bg-white/10 text-white border-white/20">Public</Badge>
                            )}
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
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{incident.description}</p>
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-500">
                            {incident.status === 'resolved' ? 'Resolved: ' : 'Started: '}{incident.timestamp}
                          </div>
                          
                          {incident.status !== 'resolved' && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-7 px-2 border-gray-700 hover:bg-gray-800">
                                  Update <ChevronDown className="h-3 w-3 ml-1" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-gray-900 border-gray-700">
                                <DropdownMenuItem 
                                  className="text-yellow-300 hover:bg-gray-800 focus:bg-gray-800"
                                  onClick={() => updateIncidentStatus(incident.id, 'investigating', 'yellow')}
                                >
                                  <AlertTriangle className="h-4 w-4 mr-2" /> Investigating
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-orange-300 hover:bg-gray-800 focus:bg-gray-800"
                                  onClick={() => updateIncidentStatus(incident.id, 'identified', 'orange')}
                                >
                                  <Search className="h-4 w-4 mr-2" /> Identified
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-blue-300 hover:bg-gray-800 focus:bg-gray-800"
                                  onClick={() => updateIncidentStatus(incident.id, 'monitoring', 'blue')}
                                >
                                  <Eye className="h-4 w-4 mr-2" /> Monitoring
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-red-300 hover:bg-gray-800 focus:bg-gray-800"
                                  onClick={() => updateIncidentStatus(incident.id, 'critical', 'red')}
                                >
                                  <AlertOctagon className="h-4 w-4 mr-2" /> Critical
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-gray-700" />
                                <DropdownMenuItem 
                                  className="text-green-300 hover:bg-gray-800 focus:bg-gray-800"
                                  onClick={() => updateIncidentStatus(incident.id, 'resolved', 'green')}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" /> Resolved
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {incidents.length === 0 && (
                      <div className="text-center py-10">
                        <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-3 opacity-50" />
                        <p className="text-gray-400">No active incidents reported</p>
                        <p className="text-gray-500 text-sm mt-1">All systems are operational</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-gray-900/80 to-black/90 backdrop-blur-sm border-gray-800/40 shadow-xl shadow-black/20 lg:col-span-2">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>System Logs</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="log-level" className="text-sm">Log Level:</Label>
                        <select 
                          id="log-level" 
                          className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm"
                          value={logLevel}
                          onChange={(e) => setLogLevel(e.target.value)}
                        >
                          <option value="error">Error</option>
                          <option value="warn">Warning</option>
                          <option value="info">Info</option>
                          <option value="debug">Debug</option>
                        </select>
                      </div>
                    </div>
                    <CardDescription>Recent system logs related to bot operations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea 
                      readOnly
                      className="font-mono text-sm h-60 bg-gray-900/50 border-gray-700"
                      value={systemLogs}
                    />
                  </CardContent>
                  <CardFooter className="justify-between">
                    <Button variant="outline" className="border-gray-700 hover:bg-gray-800">
                      Download Logs
                    </Button>
                    <Button 
                      className="bg-gradient-to-r from-white to-gray-300 hover:from-gray-300 hover:to-gray-400 text-black"
                      onClick={refreshLogs}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" /> Refresh Logs
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="statistics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard 
                  title="Servers" 
                  value={stats.servers.toLocaleString()} 
                  description="Total Discord servers" 
                  icon={<Server className="h-5 w-5 text-white" />}
                  onUpdate={(value) => updateStats('servers', value)}
                />
                <StatCard 
                  title="Users" 
                  value={stats.users.toLocaleString()} 
                  description="Total Discord users" 
                  icon={<User className="h-5 w-5 text-white" />}
                  onUpdate={(value) => updateStats('users', value)}
                />
                <StatCard 
                  title="Commands Run" 
                  value={stats.commandsRun.toLocaleString()} 
                  description="Total commands executed" 
                  icon={<Code className="h-5 w-5 text-white" />}
                  onUpdate={(value) => updateStats('commandsRun', value)}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="servers">
              <div className="bg-gradient-to-br from-gray-900/80 to-black/90 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-800/40 shadow-xl shadow-black/20 p-6">
                <h3 className="text-xl font-semibold mb-4">Server Management</h3>
                <p className="text-gray-400">
                  This section is under development. Server management features will be available soon!
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="users">
              <div className="bg-gradient-to-br from-gray-900/80 to-black/90 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-800/40 shadow-xl shadow-black/20 p-6">
                <h3 className="text-xl font-semibold mb-4">User Management</h3>
                <p className="text-gray-400">
                  This section is under development. User management features will be available soon!
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="commands">
              <div className="bg-gradient-to-br from-gray-900/80 to-black/90 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-800/40 shadow-xl shadow-black/20 p-6">
                <h3 className="text-xl font-semibold mb-4">Command Analytics</h3>
                <p className="text-gray-400">
                  This section is under development. Command analytics will be available soon!
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="logs">
              <div className="bg-gradient-to-br from-gray-900/80 to-black/90 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-800/40 shadow-xl shadow-black/20 p-6">
                <h3 className="text-xl font-semibold mb-4">Error Logs</h3>
                <p className="text-gray-400">
                  This section is under development. Error logs will be available soon!
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  onUpdate: (value: number) => void;
}

function StatCard({ title, value, description, icon, onUpdate }: StatCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newValue, setNewValue] = useState(value.replace(/,/g, ''));
  
  const handleSave = () => {
    const numValue = parseInt(newValue);
    if (!isNaN(numValue)) {
      onUpdate(numValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <Card className="bg-gradient-to-br from-gray-900/80 to-black/90 backdrop-blur-sm border-gray-800/40 shadow-xl shadow-black/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Input 
            value={newValue} 
            onChange={(e) => setNewValue(e.target.value)} 
            className="text-lg font-bold bg-gray-900/50 border-gray-700"
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
          <div 
            className="text-3xl font-bold cursor-pointer hover:text-gray-300" 
            onClick={() => setIsEditing(true)}
          >
            {value}
          </div>
        )}
        <p className="text-sm text-muted-foreground pt-1">{description}</p>
      </CardContent>
      <CardFooter>
        {isEditing ? (
          <div className="flex gap-2 w-full">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 border-gray-700 hover:bg-gray-800"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
            <Button 
              size="sm" 
              className="flex-1 bg-gradient-to-r from-white to-gray-300 hover:from-gray-300 hover:to-gray-400 text-black"
              onClick={handleSave}
            >
              Save
            </Button>
          </div>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full border-gray-700 hover:bg-gray-800"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}