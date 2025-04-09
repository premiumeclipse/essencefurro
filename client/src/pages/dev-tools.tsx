import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Server, User, Bot, Code, ShieldAlert, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
          <Tabs defaultValue="statistics" className="w-full">
            <TabsList className="bg-gray-900/50 border border-gray-800 mb-6">
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