import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertOctagon, Activity, Server, Users, CheckCircle, Clock, Send, Bot, Bell, LogOut, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Counter } from '@/components/ui/counter';

// Utility to get WebSocket URL based on current environment
const getWebSocketUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws`;
};

// User types for the dashboard
type UserStatus = 'online' | 'idle' | 'dnd' | 'offline';

type UserSession = {
  userId: string;
  username: string;
  status: UserStatus;
  lastActive: string;
  serverId?: string;
  activities?: string[];
};

// Command types for bot interactions
type CommandCategory = 'moderation' | 'music' | 'utility' | 'fun';

type Command = {
  name: string;
  description: string;
  usage: string;
  category: CommandCategory;
};

// Chat message type for command results
type ChatMessage = {
  id: string;
  content: string;
  timestamp: Date;
  sender: 'user' | 'bot';
  status?: 'sending' | 'sent' | 'error';
};

export default function Dashboard() {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');
  const [botConnected, setBotConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<UserSession[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [commandInput, setCommandInput] = useState('');
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Generate a mock user ID and username for demo purposes
  useEffect(() => {
    // In a real app, this would come from authentication
    const mockUserId = 'user_' + Math.random().toString(36).substring(2, 9);
    const mockUsername = 'User_' + Math.random().toString(36).substring(2, 5);
    setUserId(mockUserId);
    setUsername(mockUsername);
  }, []);
  
  // Bot status interface
  interface BotStatusData {
    isOnline: boolean;
    uptime: number;
    lastHeartbeat: string;
    connectedServers: number;
    activeUsers: number;
    commandsProcessed: number;
  }

  // Bot status query
  const { data: botStatus, isLoading: isBotStatusLoading } = useQuery<BotStatusData>({ 
    queryKey: ['/api/bot/status'],
    refetchInterval: 15000
  });
  
  // Available commands query
  const { data: botCommands } = useQuery<Command[]>({ 
    queryKey: ['/api/bot/commands'] 
  });
  
  // WebSocket connection and message handling
  useEffect(() => {
    if (!userId || !username) return;
    
    const connectWebSocket = () => {
      const ws = new WebSocket(getWebSocketUrl());
      wsRef.current = ws;
      
      ws.onopen = () => {
        console.log('WebSocket connection opened');
        setConnected(true);
        
        // Authenticate with the server
        ws.send(JSON.stringify({
          type: 'auth',
          userId,
          username
        }));
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received WebSocket message:', data);
          
          switch (data.type) {
            case 'bot_status':
              setBotConnected(data.status === 'connected');
              
              toast({
                title: `Bot ${data.status === 'connected' ? 'Connected' : 'Disconnected'}`,
                description: `The bot is now ${data.status}`,
                variant: data.status === 'connected' ? 'default' : 'destructive',
              });
              break;
              
            case 'bot_stats_update':
              // This would update local bot stats state if needed
              break;
              
            case 'command_result':
              // Add bot response to chat
              setChatMessages(prev => [
                ...prev,
                {
                  id: Date.now().toString(),
                  content: data.error ? `Error: ${data.error}` : data.result,
                  timestamp: new Date(),
                  sender: 'bot',
                }
              ]);
              break;
              
            case 'command_received':
              // Update the status of the sent message
              setChatMessages(prev => prev.map(msg => 
                msg.id === data.requestId 
                  ? { ...msg, status: 'sent' }
                  : msg
              ));
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onclose = () => {
        console.log('WebSocket connection closed');
        setConnected(false);
        
        // Attempt to reconnect after a delay
        setTimeout(() => {
          if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
            connectWebSocket();
          }
        }, 5000);
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        ws.close();
      };
    };
    
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [userId, username, toast]);
  
  // Fetch active users
  useEffect(() => {
    const fetchActiveUsers = async () => {
      try {
        const response = await fetch('/api/users/active');
        if (response.ok) {
          const data = await response.json();
          setActiveUsers(data);
        }
      } catch (error) {
        console.error('Error fetching active users:', error);
      }
    };
    
    fetchActiveUsers();
    const interval = setInterval(fetchActiveUsers, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);
  
  // Send command to bot
  const sendCommand = () => {
    if (!commandInput.trim() || !wsRef.current || !connected) return;
    
    const requestId = Date.now().toString();
    
    // Add user message to chat
    setChatMessages(prev => [
      ...prev,
      {
        id: requestId,
        content: commandInput,
        timestamp: new Date(),
        sender: 'user',
        status: 'sending'
      }
    ]);
    
    // Send command to bot via WebSocket
    wsRef.current.send(JSON.stringify({
      type: 'run_command',
      command: commandInput.split(' ')[0],
      params: commandInput.split(' ').slice(1).join(' '),
      requestId
    }));
    
    setCommandInput('');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">essence Dashboard</h1>
              <p className="text-gray-400">Control and monitor your Discord bot</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`w-3 h-3 rounded-full ${botConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{botConnected ? 'Bot Online' : 'Bot Offline'}</span>
              
              <Badge variant="outline" className="ml-4 bg-gray-800/50 hover:bg-gray-700/50">
                <User className="w-4 h-4 mr-1" />
                {username}
              </Badge>
            </div>
          </div>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar with stats */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-b from-gray-900 to-black border-gray-800">
              <CardHeader>
                <CardTitle>Bot Statistics</CardTitle>
                <CardDescription>Current performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {botStatus ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Activity className="w-4 h-4 mr-2 text-green-500" />
                        <span className="text-sm text-gray-400">Status</span>
                      </div>
                      <span className={botStatus.isOnline ? 'text-green-500' : 'text-red-500'}>
                        {botStatus.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Server className="w-4 h-4 mr-2 text-blue-500" />
                        <span className="text-sm text-gray-400">Servers</span>
                      </div>
                      <Counter value={botStatus.connectedServers || 0} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-indigo-500" />
                        <span className="text-sm text-gray-400">Users</span>
                      </div>
                      <Counter value={botStatus.activeUsers || 0} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-yellow-500" />
                        <span className="text-sm text-gray-400">Commands</span>
                      </div>
                      <Counter value={botStatus.commandsProcessed || 0} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-purple-500" />
                        <span className="text-sm text-gray-400">Uptime</span>
                      </div>
                      <span>{botStatus.uptime ? Math.floor(botStatus.uptime / 3600) + 'h' : 'N/A'}</span>
                    </div>
                  </>
                ) : (
                  <div className="py-6">
                    <div className="animate-pulse space-y-3">
                      <div className="h-3 bg-gray-700 rounded"></div>
                      <div className="h-3 bg-gray-700 rounded w-5/6"></div>
                      <div className="h-3 bg-gray-700 rounded"></div>
                      <div className="h-3 bg-gray-700 rounded w-4/6"></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-b from-gray-900 to-black border-gray-800 mt-4">
              <CardHeader>
                <CardTitle>Active Users</CardTitle>
                <CardDescription>Currently online</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                  {activeUsers.length > 0 ? (
                    activeUsers.map(user => (
                      <div key={user.userId} className="flex items-center p-2 rounded-md hover:bg-gray-800/50">
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600">
                            {user.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{user.username}</p>
                          <p className="text-xs text-gray-500 truncate">
                            Last active: {new Date(user.lastActive).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${
                          user.status === 'online' ? 'bg-green-500' :
                          user.status === 'idle' ? 'bg-yellow-500' :
                          user.status === 'dnd' ? 'bg-red-500' :
                          'bg-gray-500'
                        }`}></div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-sm text-gray-500">
                      No active users
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main dashboard area */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="chat" className="mb-6">
              <TabsList className="bg-gray-900/70 border border-gray-800">
                <TabsTrigger value="chat">Chat & Commands</TabsTrigger>
                <TabsTrigger value="commands">Available Commands</TabsTrigger>
                <TabsTrigger value="logs">Bot Logs</TabsTrigger>
              </TabsList>
              
              <TabsContent value="chat">
                <Card className="bg-gradient-to-b from-gray-900 to-black border-gray-800">
                  <CardHeader>
                    <CardTitle>Bot Communication</CardTitle>
                    <CardDescription>Send commands and view responses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px] overflow-y-auto mb-4 p-4 bg-gray-900/50 rounded-md border border-gray-800 custom-scrollbar">
                      {chatMessages.length > 0 ? (
                        <div className="space-y-4">
                          {chatMessages.map((message) => (
                            <div 
                              key={message.id}
                              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div 
                                className={`max-w-[80%] p-3 rounded-lg ${
                                  message.sender === 'user' 
                                    ? 'bg-indigo-600/40 border border-indigo-600/40 ml-auto' 
                                    : 'bg-gray-800/80 border border-gray-700/40 mr-auto'
                                }`}
                              >
                                <div className="flex items-center mb-1">
                                  <span className="text-xs font-medium">
                                    {message.sender === 'user' ? username : 'essence bot'}
                                  </span>
                                  <span className="text-xs text-gray-400 ml-2">
                                    {message.timestamp.toLocaleTimeString()}
                                  </span>
                                  {message.status === 'sending' && (
                                    <span className="ml-2 text-xs text-yellow-400">Sending...</span>
                                  )}
                                </div>
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center text-gray-500">
                            <Bot className="w-12 h-12 mx-auto mb-3 opacity-40" />
                            <p>No messages yet</p>
                            <p className="text-sm">Send a command to the bot to start chatting</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="w-full flex space-x-2">
                      <Input
                        placeholder="Type a command (e.g., >help, >ping)"
                        value={commandInput}
                        onChange={(e) => setCommandInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendCommand()}
                        className="flex-1 bg-gray-800 border-gray-700"
                        disabled={!connected || !botConnected}
                      />
                      <Button 
                        onClick={sendCommand}
                        disabled={!connected || !botConnected}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send
                      </Button>
                    </div>
                    {!botConnected && (
                      <p className="w-full text-center text-amber-400 text-sm mt-2">
                        Bot is currently offline. Commands will not be processed.
                      </p>
                    )}
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="commands">
                <Card className="bg-gradient-to-b from-gray-900 to-black border-gray-800">
                  <CardHeader>
                    <CardTitle>Available Commands</CardTitle>
                    <CardDescription>All commands supported by the bot</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {botCommands ? (
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        {['utility', 'moderation', 'music', 'fun'].map(category => (
                          <div key={category} className="space-y-3">
                            <h3 className="text-lg font-semibold capitalize mb-2">{category}</h3>
                            <div className="space-y-2">
                              {botCommands
                                .filter(cmd => cmd.category === category)
                                .map(command => (
                                  <div 
                                    key={command.name}
                                    className="p-3 rounded-md bg-gray-800/50 border border-gray-700/40 hover:bg-gray-800"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div className="font-medium">{command.name}</div>
                                      <Badge variant="outline" className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                                        {command.category}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-gray-400 mt-1">{command.description}</p>
                                    <div className="mt-2 text-xs bg-black/40 p-1 rounded font-mono">
                                      {command.usage}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-20 text-center">
                        <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-400">Loading available commands...</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="logs">
                <Card className="bg-gradient-to-b from-gray-900 to-black border-gray-800">
                  <CardHeader>
                    <CardTitle>Bot Activity Logs</CardTitle>
                    <CardDescription>Recent events and actions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      className="h-[400px] font-mono text-sm bg-black/50 resize-none custom-scrollbar"
                      readOnly
                      value={`[${new Date().toLocaleTimeString()}] Connected to dashboard
[${new Date().toLocaleTimeString()}] WebSocket connection established
[${new Date().toLocaleTimeString()}] User authenticated: ${username}
[${new Date().toLocaleTimeString()}] Monitoring for bot connection...
${botConnected ? `[${new Date().toLocaleTimeString()}] Bot connected and ready` : ''}
`}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}