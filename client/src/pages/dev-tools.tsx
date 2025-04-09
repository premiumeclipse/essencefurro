import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Server, User, Bot, Code, ShieldAlert, Activity, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
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
      timestamp: 'April 9, 2025 - 03:25 AM UTC'
    },
    {
      id: 2,
      title: 'API Rate Limiting Resolved',
      description: 'Previously experienced Discord API rate limiting issues have been resolved.',
      status: 'resolved',
      type: 'green',
      timestamp: 'April 9, 2025 - 02:15 AM UTC'
    }
  ]);
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
                    <CardTitle>Active Incidents</CardTitle>
                    <CardDescription>Current issues affecting the bot</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                          <h4 className="font-semibold text-yellow-300">Database Connection Issues</h4>
                        </div>
                        <Badge variant="outline" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50">Investigating</Badge>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">Intermittent database connection issues affecting some user profile operations.</p>
                      <div className="text-xs text-gray-500">Started: April 9, 2025 - 03:25 AM UTC</div>
                    </div>
                    
                    <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          <h4 className="font-semibold text-green-300">API Rate Limiting Resolved</h4>
                        </div>
                        <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/50">Resolved</Badge>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">Previously experienced Discord API rate limiting issues have been resolved.</p>
                      <div className="text-xs text-gray-500">Resolved: April 9, 2025 - 02:15 AM UTC</div>
                    </div>
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