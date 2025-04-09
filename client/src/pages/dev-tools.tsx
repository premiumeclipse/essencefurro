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

// Type for incident
type IncidentType = {
  id: number;
  title: string;
  description: string;
  status: string;
  type: string;
  timestamp: string;
  public: boolean;
};

// Type for system status
type SystemStatusType = {
  botCore: { status: string; indicator: string };
  discordGateway: { status: string; indicator: string };
  database: { status: string; indicator: string };
  apiEndpoints: { status: string; indicator: string };
  commandProcessing: { status: string; indicator: string };
};

export default function DevTools() {
  const [location, setLocation] = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState({
    servers: 5000,
    users: 1500000,
    commandsRun: 25000000,
  });
  const [systemStatus, setSystemStatus] = useState<SystemStatusType>({
    botCore: { status: 'operational', indicator: 'green' },
    discordGateway: { status: 'connected', indicator: 'green' },
    database: { status: 'degraded', indicator: 'yellow' },
    apiEndpoints: { status: 'operational', indicator: 'green' },
    commandProcessing: { status: 'operational', indicator: 'green' },
  });
  const [incidents, setIncidents] = useState<IncidentType[]>([]);
  const [newIncident, setNewIncident] = useState({
    title: '',
    description: '',
    status: 'investigating',
    type: 'yellow',
    public: true
  });
  const [systemLogs, setSystemLogs] = useState(`[2025-04-09 03:15:22] [INFO] Bot started successfully
[2025-04-09 03:15:23] [INFO] Connected to Discord gateway
[2025-04-09 03:15:23] [INFO] Registered 42 commands
[2025-04-09 03:17:45] [WARN] Database connection latency increased to 250ms
[2025-04-09 03:22:37] [ERROR] Database connection timeout after 5 retries
[2025-04-09 03:22:38] [INFO] Auto-reconnect procedure initiated
[2025-04-09 03:23:05] [INFO] Database connection re-established, latency: 150ms`);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableIncident, setEditableIncident] = useState<IncidentType | null>(null);

  useEffect(() => {
    // Load incidents when component mounts
    refreshIncidents();
  }, []);

  // Function to check password
  const checkPassword = () => {
    if (password === 'essence@2025furry') {
      setIsAuthorized(true);
      refreshIncidents();
      toast({
        title: 'Access Granted',
        description: 'Welcome to the developer dashboard.',
      });
    } else {
      toast({
        title: 'Access Denied',
        description: 'Invalid password. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Function to refresh incidents
  const refreshIncidents = async () => {
    try {
      console.log('Refreshing incidents list...');
      const response = await fetch('/api/incidents/all');
      if (response.ok) {
        const data = await response.json();
        console.log('Refreshed incidents data:', data);
        setIncidents(data);
        return true;
      } else {
        console.error('Failed to refresh incidents:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error refreshing incidents:', error);
      return false;
    }
  };

  // Function to handle new incident submission
  const handleNewIncident = async () => {
    if (!newIncident.title.trim() || !newIncident.description.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Title and description are required.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newIncident),
      });

      if (response.ok) {
        const createdIncident = await response.json();
        setIncidents(prev => [createdIncident, ...prev]);
        setNewIncident({
          title: '',
          description: '',
          status: 'investigating',
          type: 'yellow',
          public: true
        });
        setIsDialogOpen(false);
        toast({
          title: 'Incident Created',
          description: 'The incident has been published successfully.',
        });
        await refreshIncidents();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to create incident. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating incident:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Function to update an incident
  const updateIncident = async () => {
    if (!editableIncident) return;

    try {
      const response = await fetch(`/api/incidents/${editableIncident.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: editableIncident.status,
          type: editableIncident.type,
          public: editableIncident.public
        }),
      });

      if (response.ok) {
        setIsEditing(false);
        setEditableIncident(null);
        await refreshIncidents();
        toast({
          title: 'Incident Updated',
          description: 'The incident has been updated successfully.',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update incident. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating incident:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Function to refresh system logs
  const refreshLogs = () => {
    setSystemLogs(prev => `${prev}\n[2025-04-09 ${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}:${new Date().getSeconds().toString().padStart(2, '0')}] [INFO] System log refreshed manually`);
    toast({
      title: 'Logs Refreshed',
      description: 'System logs have been updated.',
    });
  };

  // Update bot stats
  const updateBotStats = async () => {
    try {
      const response = await fetch('/api/stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stats),
      });

      if (response.ok) {
        toast({
          title: 'Stats Updated',
          description: 'Bot statistics have been updated successfully.',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update bot statistics. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating stats:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md p-6 rounded-lg border border-gray-800 bg-black/60 backdrop-blur-sm shadow-xl"
        >
          <div className="flex items-center mb-6">
            <Link href="/">
              <Button variant="ghost" size="icon" className="mr-2 hover:bg-gray-900">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Developer Tools</h1>
          </div>
          
          <div className="space-y-4">
            <div className="text-sm text-gray-400">
              This area is restricted to authorized personnel only. Please enter your password to continue.
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter developer password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-900/50 border-gray-800 text-white"
                onKeyDown={(e) => e.key === 'Enter' && checkPassword()}
              />
            </div>
            
            <Button 
              className="w-full bg-gradient-to-r from-white to-gray-300 hover:from-gray-300 hover:to-gray-400 text-black"
              onClick={checkPassword}
            >
              Access Dashboard
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="ghost" size="icon" className="mr-2 hover:bg-gray-900">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">essence Developer Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className="bg-green-500/20 text-green-400 hover:bg-green-500/20 border-green-500/30"
            >
              Admin Access
            </Badge>
            <Button variant="outline" className="border-gray-700 hover:bg-gray-800">
              <RefreshCw className="h-4 w-4 mr-1" /> Refresh Data
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="status" className="w-full">
          <TabsList className="bg-gray-900/50 border border-gray-800">
            <TabsTrigger value="status" className="data-[state=active]:bg-white data-[state=active]:text-black">
              <Activity className="h-4 w-4 mr-1" />
              System Status
            </TabsTrigger>
            <TabsTrigger value="statistics" className="data-[state=active]:bg-white data-[state=active]:text-black">
              <Server className="h-4 w-4 mr-1" />
              Statistics
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-white data-[state=active]:text-black">
              <Code className="h-4 w-4 mr-1" />
              System Logs
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="status" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-gray-900/80 to-black/90 backdrop-blur-sm border-gray-800/40 shadow-xl shadow-black/20">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>System Status</CardTitle>
                  </div>
                  <CardDescription>Current operational status of all systems</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                      <div className="flex items-center">
                        <Bot className="h-5 w-5 mr-2 text-gray-400" />
                        <span>Bot Core</span>
                      </div>
                      <Badge className={cn(
                        "font-normal",
                        systemStatus.botCore.indicator === 'green' 
                          ? "bg-green-500/20 text-green-400 hover:bg-green-500/20 border-green-500/30" 
                          : systemStatus.botCore.indicator === 'yellow' 
                            ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 border-yellow-500/30"
                            : "bg-red-500/20 text-red-400 hover:bg-red-500/20 border-red-500/30"
                      )}>
                        {systemStatus.botCore.status}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                      <div className="flex items-center">
                        <Activity className="h-5 w-5 mr-2 text-gray-400" />
                        <span>Discord Gateway</span>
                      </div>
                      <Badge className={cn(
                        "font-normal",
                        systemStatus.discordGateway.indicator === 'green' 
                          ? "bg-green-500/20 text-green-400 hover:bg-green-500/20 border-green-500/30" 
                          : systemStatus.discordGateway.indicator === 'yellow' 
                            ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 border-yellow-500/30"
                            : "bg-red-500/20 text-red-400 hover:bg-red-500/20 border-red-500/30"
                      )}>
                        {systemStatus.discordGateway.status}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                      <div className="flex items-center">
                        <Server className="h-5 w-5 mr-2 text-gray-400" />
                        <span>Database</span>
                      </div>
                      <Badge className={cn(
                        "font-normal",
                        systemStatus.database.indicator === 'green' 
                          ? "bg-green-500/20 text-green-400 hover:bg-green-500/20 border-green-500/30" 
                          : systemStatus.database.indicator === 'yellow' 
                            ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 border-yellow-500/30"
                            : "bg-red-500/20 text-red-400 hover:bg-red-500/20 border-red-500/30"
                      )}>
                        {systemStatus.database.status}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                      <div className="flex items-center">
                        <Code className="h-5 w-5 mr-2 text-gray-400" />
                        <span>API Endpoints</span>
                      </div>
                      <Badge className={cn(
                        "font-normal",
                        systemStatus.apiEndpoints.indicator === 'green' 
                          ? "bg-green-500/20 text-green-400 hover:bg-green-500/20 border-green-500/30" 
                          : systemStatus.apiEndpoints.indicator === 'yellow' 
                            ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 border-yellow-500/30"
                            : "bg-red-500/20 text-red-400 hover:bg-red-500/20 border-red-500/30"
                      )}>
                        {systemStatus.apiEndpoints.status}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <ShieldAlert className="h-5 w-5 mr-2 text-gray-400" />
                        <span>Command Processing</span>
                      </div>
                      <Badge className={cn(
                        "font-normal",
                        systemStatus.commandProcessing.indicator === 'green' 
                          ? "bg-green-500/20 text-green-400 hover:bg-green-500/20 border-green-500/30" 
                          : systemStatus.commandProcessing.indicator === 'yellow' 
                            ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 border-yellow-500/30"
                            : "bg-red-500/20 text-red-400 hover:bg-red-500/20 border-red-500/30"
                      )}>
                        {systemStatus.commandProcessing.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-gray-900/80 to-black/90 backdrop-blur-sm border-gray-800/40 shadow-xl shadow-black/20">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Active Incidents</CardTitle>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-gray-700 hover:bg-gray-800"
                        onClick={refreshIncidents}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" /> Refresh
                      </Button>
                      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="bg-gradient-to-r from-white to-gray-300 hover:from-gray-300 hover:to-gray-400 text-black">
                            <PlusSquare className="h-4 w-4 mr-1" /> New Incident
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Create New Incident</DialogTitle>
                            <DialogDescription className="text-gray-400">
                              Report a new incident or issue with the bot.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="title">Title</Label>
                              <Input
                                id="title"
                                value={newIncident.title}
                                onChange={(e) => setNewIncident({...newIncident, title: e.target.value})}
                                placeholder="Brief incident title"
                                className="bg-gray-800 border-gray-700"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="description">Description</Label>
                              <Textarea
                                id="description"
                                value={newIncident.description}
                                onChange={(e) => setNewIncident({...newIncident, description: e.target.value})}
                                placeholder="Detailed description of the incident"
                                className="bg-gray-800 border-gray-700 min-h-[100px]"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <select
                                  id="status"
                                  value={newIncident.status}
                                  onChange={(e) => setNewIncident({...newIncident, status: e.target.value})}
                                  className="w-full rounded-md bg-gray-800 border-gray-700 text-white p-2"
                                >
                                  <option value="investigating">Investigating</option>
                                  <option value="identified">Identified</option>
                                  <option value="monitoring">Monitoring</option>
                                  <option value="resolved">Resolved</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="type">Severity</Label>
                                <select
                                  id="type"
                                  value={newIncident.type}
                                  onChange={(e) => setNewIncident({...newIncident, type: e.target.value})}
                                  className="w-full rounded-md bg-gray-800 border-gray-700 text-white p-2"
                                >
                                  <option value="green">Low (Green)</option>
                                  <option value="yellow">Medium (Yellow)</option>
                                  <option value="orange">High (Orange)</option>
                                  <option value="red">Critical (Red)</option>
                                </select>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="public"
                                checked={newIncident.public}
                                onCheckedChange={(checked) => setNewIncident({...newIncident, public: checked})}
                              />
                              <Label htmlFor="public">Make this incident visible to users</Label>
                            </div>
                          </div>
                          <DialogFooter className="bg-gray-900">
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setIsDialogOpen(false);
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
                  </div>
                  <CardDescription>Current issues affecting the bot</CardDescription>
                </CardHeader>
                <CardContent className="max-h-[400px] overflow-y-auto">
                  {incidents.map(incident => (
                    <div 
                      key={incident.id}
                      className="mb-4 rounded-md border border-gray-800 bg-black/30 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {incident.type === 'red' && <AlertOctagon className="h-5 w-5 text-red-500 mr-2" />}
                          {incident.type === 'orange' && <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />}
                          {incident.type === 'yellow' && <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />}
                          {incident.type === 'green' && <CheckCircle className="h-5 w-5 text-green-500 mr-2" />}
                          <h3 className="font-semibold">{incident.title}</h3>
                        </div>
                        <div className="flex items-center space-x-2">
                          {incident.public && (
                            <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                              Public
                            </Badge>
                          )}
                          <Badge className={cn(
                            "font-normal",
                            incident.status === 'resolved'
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : incident.status === 'monitoring'
                                ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                : incident.status === 'identified'
                                  ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                  : "bg-red-500/20 text-red-400 border-red-500/30"
                          )}>
                            {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800 text-white">
                              <DropdownMenuItem 
                                className="hover:bg-gray-800 cursor-pointer"
                                onClick={() => {
                                  setEditableIncident(incident);
                                  setIsEditing(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Manage Incident
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-gray-800" />
                              <DropdownMenuItem 
                                className="hover:bg-gray-800 cursor-pointer text-red-400"
                                onClick={async () => {
                                  // Quick resolve an incident
                                  try {
                                    const response = await fetch(`/api/incidents/${incident.id}`, {
                                      method: 'PATCH',
                                      headers: {
                                        'Content-Type': 'application/json',
                                      },
                                      body: JSON.stringify({
                                        status: 'resolved',
                                        type: 'green'
                                      }),
                                    });
                                    
                                    if (response.ok) {
                                      await refreshIncidents();
                                      toast({
                                        title: 'Incident Resolved',
                                        description: 'The incident has been marked as resolved.',
                                      });
                                    }
                                  } catch (error) {
                                    console.error('Error resolving incident:', error);
                                  }
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Resolved
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <p className="text-gray-400 mt-2 text-sm">{incident.description}</p>
                      <div className="mt-3 text-xs text-gray-500">{incident.timestamp}</div>
                    </div>
                  ))}
                  
                  {incidents.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="h-10 w-10 mx-auto mb-2 opacity-30" />
                      <p>No active incidents at this time.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-gray-900/80 to-black/90 backdrop-blur-sm border-gray-800/40 shadow-xl shadow-black/20 lg:col-span-2">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>System Analysis</CardTitle>
                  </div>
                  <CardDescription>Performance metrics and system health analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="border border-gray-800 rounded-md p-4 bg-black/30">
                      <h3 className="text-sm font-medium text-gray-400 mb-2">API Response Time</h3>
                      <div className="text-2xl font-bold">185ms</div>
                      <div className="text-xs text-green-400 mt-1">↓ 15ms from 24h avg</div>
                    </div>
                    
                    <div className="border border-gray-800 rounded-md p-4 bg-black/30">
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Gateway Latency</h3>
                      <div className="text-2xl font-bold">42ms</div>
                      <div className="text-xs text-green-400 mt-1">Stable (±3ms)</div>
                    </div>
                    
                    <div className="border border-gray-800 rounded-md p-4 bg-black/30">
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Memory Usage</h3>
                      <div className="text-2xl font-bold">768MB</div>
                      <div className="text-xs text-yellow-400 mt-1">↑ 120MB from 24h avg</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="statistics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-gray-900/80 to-black/90 backdrop-blur-sm border-gray-800/40 shadow-xl shadow-black/20">
                <CardHeader>
                  <CardTitle>Server Count</CardTitle>
                  <CardDescription>Total Discord servers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-2">
                    {stats.servers.toLocaleString()}
                  </div>
                  <Input
                    type="number"
                    value={stats.servers}
                    onChange={(e) => setStats({...stats, servers: parseInt(e.target.value) || 0})}
                    className="bg-gray-900/50 border-gray-800 text-white"
                  />
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-gray-900/80 to-black/90 backdrop-blur-sm border-gray-800/40 shadow-xl shadow-black/20">
                <CardHeader>
                  <CardTitle>User Reach</CardTitle>
                  <CardDescription>Total users in all servers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-2">
                    {stats.users.toLocaleString()}
                  </div>
                  <Input
                    type="number"
                    value={stats.users}
                    onChange={(e) => setStats({...stats, users: parseInt(e.target.value) || 0})}
                    className="bg-gray-900/50 border-gray-800 text-white"
                  />
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-gray-900/80 to-black/90 backdrop-blur-sm border-gray-800/40 shadow-xl shadow-black/20">
                <CardHeader>
                  <CardTitle>Commands Used</CardTitle>
                  <CardDescription>Total commands executed</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-2">
                    {stats.commandsRun.toLocaleString()}
                  </div>
                  <Input
                    type="number"
                    value={stats.commandsRun}
                    onChange={(e) => setStats({...stats, commandsRun: parseInt(e.target.value) || 0})}
                    className="bg-gray-900/50 border-gray-800 text-white"
                  />
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-gray-900/80 to-black/90 backdrop-blur-sm border-gray-800/40 shadow-xl shadow-black/20 md:col-span-3">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Update Bot Statistics</CardTitle>
                  </div>
                  <CardDescription>Update the stats displayed on the landing page</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm mb-4">
                    These statistics are publicly visible on the landing page. Make sure they're accurate before updating.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="bg-gradient-to-r from-white to-gray-300 hover:from-gray-300 hover:to-gray-400 text-black ml-auto"
                    onClick={updateBotStats}
                  >
                    Update Public Statistics
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="logs" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <Card className="bg-gradient-to-br from-gray-900/80 to-black/90 backdrop-blur-sm border-gray-800/40 shadow-xl shadow-black/20">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>System Logs</CardTitle>
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-gray-500" />
                        <Input
                          type="text"
                          placeholder="Search logs..."
                          className="pl-9 w-[200px] bg-gray-900/50 border-gray-800 text-white"
                        />
                      </div>
                    </div>
                  </div>
                  <CardDescription>Recent system events and notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    className="font-mono text-sm bg-black border-gray-800 h-[400px] resize-none"
                    readOnly
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
        </Tabs>
      </motion.div>
      
      {/* Dialog for editing incident */}
      {editableIncident && (
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>Manage Incident</DialogTitle>
              <DialogDescription className="text-gray-400">
                Update the status and visibility of this incident.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <Label className="text-gray-400">Title</Label>
                <div className="font-medium">{editableIncident.title}</div>
              </div>
              <div className="space-y-1">
                <Label className="text-gray-400">Description</Label>
                <div className="text-sm">{editableIncident.description}</div>
              </div>
              <Separator className="bg-gray-800" />
              <div className="space-y-2">
                <Label htmlFor="incidentStatus">Status</Label>
                <select
                  id="incidentStatus"
                  value={editableIncident.status}
                  onChange={(e) => setEditableIncident({...editableIncident, status: e.target.value})}
                  className="w-full rounded-md bg-gray-800 border-gray-700 text-white p-2"
                >
                  <option value="investigating">Investigating</option>
                  <option value="identified">Identified</option>
                  <option value="monitoring">Monitoring</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="incidentType">Severity</Label>
                <select
                  id="incidentType"
                  value={editableIncident.type}
                  onChange={(e) => setEditableIncident({...editableIncident, type: e.target.value})}
                  className="w-full rounded-md bg-gray-800 border-gray-700 text-white p-2"
                >
                  <option value="green">Low (Green)</option>
                  <option value="yellow">Medium (Yellow)</option>
                  <option value="orange">High (Orange)</option>
                  <option value="red">Critical (Red)</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="incidentPublic"
                  checked={editableIncident.public}
                  onCheckedChange={(checked) => setEditableIncident({...editableIncident, public: checked})}
                />
                <Label htmlFor="incidentPublic">Make this incident visible to users</Label>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false);
                  setEditableIncident(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                className="bg-gradient-to-r from-white to-gray-300 hover:from-gray-300 hover:to-gray-400 text-black"
                onClick={updateIncident}
              >
                Update Incident
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}