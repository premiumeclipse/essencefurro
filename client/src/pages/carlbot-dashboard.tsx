import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Settings, Server, BarChart3, Shield, MessageSquare, 
  Users, Command, Bell, ArrowRight, Search, Home, 
  Filter, LogOut, Trash2, Plus, Save, CheckCircle,
  XCircle, Edit, ChevronDown, ChevronRight, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import type { Guild, ModerationAction, CustomCommand, AutoModRule } from '@shared/schema';

// Temporary mock data for development - this would come from the API
const mockGuilds: Partial<Guild>[] = [
  {
    id: 1,
    name: 'Furry Community',
    discordId: '123456789012345678',
    iconUrl: 'https://i.pravatar.cc/128?img=1',
    memberCount: 1250,
    settings: {
      moderationEnabled: true,
      welcomeMessage: 'Welcome to our server! Please read the rules.',
      leaveMessage: null,
      welcomeChannelId: '123456789012345679',
      logChannelId: '123456789012345680',
      autoRoleId: '123456789012345681',
      muteRoleId: '123456789012345682'
    }
  },
  {
    id: 2,
    name: 'Gaming Server',
    discordId: '223456789012345678',
    iconUrl: 'https://i.pravatar.cc/128?img=2',
    memberCount: 3450,
    settings: {
      moderationEnabled: true,
      welcomeMessage: null,
      leaveMessage: null,
      welcomeChannelId: null,
      logChannelId: '223456789012345679',
      autoRoleId: null,
      muteRoleId: '223456789012345680'
    }
  },
  {
    id: 3,
    name: 'Art Gallery',
    discordId: '323456789012345678',
    iconUrl: 'https://i.pravatar.cc/128?img=3',
    memberCount: 876,
    settings: {
      moderationEnabled: false,
      welcomeMessage: 'Welcome to the Art Gallery! Share your creations in #showcase',
      leaveMessage: 'Sorry to see you go!',
      welcomeChannelId: '323456789012345679',
      logChannelId: null,
      autoRoleId: '323456789012345680',
      muteRoleId: null
    }
  }
];

const mockModActions: Partial<ModerationAction>[] = [
  {
    id: 1,
    guildId: 1,
    targetDiscordId: '111222333444555666',
    moderatorDiscordId: '999888777666555444',
    type: 'warn',
    reason: 'Spamming in #general',
    createdAt: new Date('2025-04-08T14:30:00'),
    caseId: 1
  },
  {
    id: 2,
    guildId: 1,
    targetDiscordId: '111222333444555666',
    moderatorDiscordId: '999888777666555444',
    type: 'mute',
    reason: 'Continued spamming after warning',
    duration: 3600, // 1 hour
    createdAt: new Date('2025-04-08T14:45:00'),
    caseId: 2
  },
  {
    id: 3,
    guildId: 1,
    targetDiscordId: '222333444555666777',
    moderatorDiscordId: '999888777666555444',
    type: 'ban',
    reason: 'Posting inappropriate content',
    createdAt: new Date('2025-04-09T09:15:00'),
    caseId: 3
  }
];

const mockCustomCommands: Partial<CustomCommand>[] = [
  {
    id: 1,
    guildId: 1,
    name: 'serverinfo',
    response: 'Server Name: **Furry Community**\nMembers: **1250**\nCreated: **January 15, 2023**',
    isEnabled: true,
    usageCount: 245
  },
  {
    id: 2,
    guildId: 1,
    name: 'rules',
    response: '1. Be respectful\n2. No spamming\n3. Use appropriate channels\n4. Listen to moderators',
    isEnabled: true,
    usageCount: 543
  },
  {
    id: 3,
    guildId: 1,
    name: 'uwu',
    response: '*nuzzles and wuzzles your chest* uwu you so warm',
    isEnabled: true,
    usageCount: 1243
  }
];

const mockAutoModRules: Partial<AutoModRule>[] = [
  {
    id: 1,
    guildId: 1,
    name: 'No Discord Invites',
    type: 'invites',
    enabled: true,
    action: 'delete',
    settings: {
      deleteMessage: true,
      notifyUser: true,
      whitelistedChannels: ['123456789012345685']
    }
  },
  {
    id: 2,
    guildId: 1,
    name: 'Banned Words',
    type: 'word-filter',
    enabled: true,
    action: 'warn',
    settings: {
      regex: '(badword1|badword2|badword3)',
      deleteMessage: true,
      notifyUser: true
    }
  },
  {
    id: 3,
    guildId: 1,
    name: 'Mention Spam',
    type: 'mention-spam',
    enabled: false,
    action: 'mute',
    duration: 900, // 15 minutes
    settings: {
      deleteMessage: true,
      notifyUser: true
    }
  }
];

export default function CarlBotDashboard() {
  const { toast } = useToast();
  const [selectedGuildId, setSelectedGuildId] = useState<number | null>(null);
  const [selectedGuild, setSelectedGuild] = useState<Partial<Guild> | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get servers where bot is installed
  const { data: guilds, isLoading: isLoadingGuilds } = useQuery({
    queryKey: ['/api/guilds'],
    // In a real app, this would be fetched from an API
    queryFn: async () => mockGuilds
  });
  
  // Moderation actions for the selected server
  const { data: moderationActions } = useQuery({
    queryKey: ['/api/guilds', selectedGuildId, 'moderation'],
    enabled: !!selectedGuildId,
    // In a real app, this would be fetched from an API
    queryFn: async () => mockModActions.filter(action => action.guildId === selectedGuildId)
  });
  
  // Custom commands for the selected server
  const { data: customCommands } = useQuery({
    queryKey: ['/api/guilds', selectedGuildId, 'commands'],
    enabled: !!selectedGuildId,
    // In a real app, this would be fetched from an API
    queryFn: async () => mockCustomCommands.filter(cmd => cmd.guildId === selectedGuildId)
  });
  
  // Auto-mod rules for the selected server
  const { data: autoModRules } = useQuery({
    queryKey: ['/api/guilds', selectedGuildId, 'automod'],
    enabled: !!selectedGuildId,
    // In a real app, this would be fetched from an API
    queryFn: async () => mockAutoModRules.filter(rule => rule.guildId === selectedGuildId)
  });
  
  // Set default selected guild
  useEffect(() => {
    if (!selectedGuildId && guilds && guilds.length > 0) {
      setSelectedGuildId(guilds[0].id || null);
    }
  }, [guilds, selectedGuildId]);
  
  // Update selected guild when ID changes
  useEffect(() => {
    if (selectedGuildId && guilds) {
      const guild = guilds.find(g => g.id === selectedGuildId);
      setSelectedGuild(guild || null);
    } else {
      setSelectedGuild(null);
    }
  }, [selectedGuildId, guilds]);
  
  // Filter guilds based on search query
  const filteredGuilds = guilds ? 
    guilds.filter(guild => 
      guild.name?.toLowerCase().includes(searchQuery.toLowerCase())
    ) : [];
  
  // Save changes to server settings
  const saveServerSettings = () => {
    if (!selectedGuild) return;
    
    // In a real app, this would be an API call
    toast({
      title: "Settings saved",
      description: `Settings for ${selectedGuild.name} have been saved.`,
      variant: "default",
    });
  };
  
  // Toggle auto-mod rule
  const toggleAutoModRule = (ruleId: number | undefined) => {
    if (!ruleId) return;
    
    // In a real app, this would be an API call
    toast({
      title: "Rule updated",
      description: "Auto-moderator rule has been updated.",
      variant: "default",
    });
  };
  
  // Delete custom command
  const deleteCustomCommand = (commandId: number | undefined) => {
    if (!commandId) return;
    
    // In a real app, this would be an API call
    toast({
      title: "Command deleted",
      description: "Custom command has been deleted.",
      variant: "destructive",
    });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-xl font-bold">essence Dashboard</h2>
            <p className="text-sm text-gray-400">Server Management</p>
          </div>
          
          {/* Server selector */}
          <div className="p-3 border-b border-gray-800">
            <div className="relative">
              <Input
                placeholder="Search servers..."
                className="bg-gray-800 border-gray-700 pl-8"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearching(true);
                }}
                onFocus={() => setIsSearching(true)}
                onBlur={() => setTimeout(() => setIsSearching(false), 200)}
              />
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          {/* Server list */}
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-1">
              {isSearching ? (
                filteredGuilds.map(guild => (
                  <button
                    key={guild.id}
                    className={`w-full flex items-center space-x-3 p-2 rounded ${
                      selectedGuildId === guild.id ? 'bg-gray-800' : 'hover:bg-gray-800/50'
                    } transition-colors`}
                    onClick={() => setSelectedGuildId(guild.id || null)}
                  >
                    <Avatar className="h-8 w-8">
                      {guild.iconUrl ? (
                        <AvatarImage src={guild.iconUrl} alt={guild.name} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600">
                          {guild.name?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium truncate">{guild.name}</p>
                      <p className="text-xs text-gray-400">{guild.memberCount} members</p>
                    </div>
                  </button>
                ))
              ) : (
                <>
                  {/* Navigation menu */}
                  <div className="mb-4">
                    <button
                      className={`w-full flex items-center space-x-3 p-2 rounded 
                        ${activeTab === 'overview' ? 'bg-gray-800' : 'hover:bg-gray-800/50'} 
                        transition-colors text-left`}
                      onClick={() => setActiveTab('overview')}
                    >
                      <Home className="h-4 w-4 text-gray-400" />
                      <span>Overview</span>
                    </button>
                    
                    <button
                      className={`w-full flex items-center space-x-3 p-2 rounded 
                        ${activeTab === 'moderation' ? 'bg-gray-800' : 'hover:bg-gray-800/50'} 
                        transition-colors text-left`}
                      onClick={() => setActiveTab('moderation')}
                    >
                      <Shield className="h-4 w-4 text-gray-400" />
                      <span>Moderation</span>
                    </button>
                    
                    <button
                      className={`w-full flex items-center space-x-3 p-2 rounded 
                        ${activeTab === 'automod' ? 'bg-gray-800' : 'hover:bg-gray-800/50'} 
                        transition-colors text-left`}
                      onClick={() => setActiveTab('automod')}
                    >
                      <Filter className="h-4 w-4 text-gray-400" />
                      <span>Auto-Moderation</span>
                    </button>
                    
                    <button
                      className={`w-full flex items-center space-x-3 p-2 rounded 
                        ${activeTab === 'commands' ? 'bg-gray-800' : 'hover:bg-gray-800/50'} 
                        transition-colors text-left`}
                      onClick={() => setActiveTab('commands')}
                    >
                      <Command className="h-4 w-4 text-gray-400" />
                      <span>Custom Commands</span>
                    </button>
                    
                    <button
                      className={`w-full flex items-center space-x-3 p-2 rounded 
                        ${activeTab === 'logs' ? 'bg-gray-800' : 'hover:bg-gray-800/50'} 
                        transition-colors text-left`}
                      onClick={() => setActiveTab('logs')}
                    >
                      <MessageSquare className="h-4 w-4 text-gray-400" />
                      <span>Logs</span>
                    </button>
                    
                    <button
                      className={`w-full flex items-center space-x-3 p-2 rounded 
                        ${activeTab === 'settings' ? 'bg-gray-800' : 'hover:bg-gray-800/50'} 
                        transition-colors text-left`}
                      onClick={() => setActiveTab('settings')}
                    >
                      <Settings className="h-4 w-4 text-gray-400" />
                      <span>Server Settings</span>
                    </button>
                  </div>
                  
                  <Separator className="my-4 bg-gray-800" />
                  
                  {/* Server list */}
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-400 px-2 mb-2">Your Servers</h3>
                    {guilds?.map(guild => (
                      <button
                        key={guild.id}
                        className={`w-full flex items-center space-x-3 p-2 rounded ${
                          selectedGuildId === guild.id ? 'bg-gray-800' : 'hover:bg-gray-800/50'
                        } transition-colors`}
                        onClick={() => setSelectedGuildId(guild.id || null)}
                      >
                        <Avatar className="h-8 w-8">
                          {guild.iconUrl ? (
                            <AvatarImage src={guild.iconUrl} alt={guild.name} />
                          ) : (
                            <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600">
                              {guild.name?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-sm font-medium truncate">{guild.name}</p>
                          <p className="text-xs text-gray-400">{guild.memberCount} members</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
          
          {/* User account */}
          <div className="p-3 border-t border-gray-800 flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600">
                U
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">User123</p>
              <p className="text-xs text-gray-400">Dashboard Admin</p>
            </div>
            <button className="text-gray-400 hover:text-white">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          {selectedGuild && (
            <header className="bg-gray-900/90 border-b border-gray-800 backdrop-blur-sm p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-10 w-10">
                  {selectedGuild.iconUrl ? (
                    <AvatarImage src={selectedGuild.iconUrl} alt={selectedGuild.name} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600">
                      {selectedGuild.name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h1 className="text-xl font-bold">{selectedGuild.name}</h1>
                  <div className="flex items-center text-sm text-gray-400">
                    <Users className="h-3 w-3 mr-1" />
                    <span>{selectedGuild.memberCount} members</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="text-gray-300 border-gray-700">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
                <Button variant="default" size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Open in Discord
                </Button>
              </div>
            </header>
          )}
          
          {/* Content area */}
          <main className="flex-1 overflow-auto p-6 bg-gradient-to-b from-gray-900 to-black">
            {selectedGuild ? (
              <>
                {/* Overview tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className="bg-gray-900/70 border-gray-800 relative overflow-hidden">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Members</CardTitle>
                          <CardDescription>Total server members</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">
                            {selectedGuild.memberCount?.toLocaleString()}
                          </div>
                          <div className="text-sm text-green-500 mt-1 flex items-center">
                            <ArrowRight className="h-3 w-3 mr-1 rotate-[-45deg]" />
                            +32 in the last week
                          </div>
                        </CardContent>
                        <div className="absolute right-4 top-4 opacity-10">
                          <Users className="h-16 w-16" />
                        </div>
                      </Card>
                      
                      <Card className="bg-gray-900/70 border-gray-800 relative overflow-hidden">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Commands Used</CardTitle>
                          <CardDescription>Total commands executed</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">24,583</div>
                          <div className="text-sm text-green-500 mt-1 flex items-center">
                            <ArrowRight className="h-3 w-3 mr-1 rotate-[-45deg]" />
                            +155 in the last week
                          </div>
                        </CardContent>
                        <div className="absolute right-4 top-4 opacity-10">
                          <Command className="h-16 w-16" />
                        </div>
                      </Card>
                      
                      <Card className="bg-gray-900/70 border-gray-800 relative overflow-hidden">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Moderation Actions</CardTitle>
                          <CardDescription>Total mod actions taken</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">152</div>
                          <div className="text-sm text-red-500 mt-1 flex items-center">
                            <ArrowRight className="h-3 w-3 mr-1 rotate-[45deg]" />
                            +12 in the last week
                          </div>
                        </CardContent>
                        <div className="absolute right-4 top-4 opacity-10">
                          <Shield className="h-16 w-16" />
                        </div>
                      </Card>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2">
                        <Card className="bg-gray-900/70 border-gray-800 h-full">
                          <CardHeader>
                            <CardTitle>Activity Overview</CardTitle>
                            <CardDescription>Messages and commands over time</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="h-[300px] flex items-center justify-center">
                              <div className="text-gray-500 flex flex-col items-center">
                                <BarChart3 className="h-16 w-16 mb-2 opacity-40" />
                                <p>Activity chart visualization will appear here</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div>
                        <Card className="bg-gray-900/70 border-gray-800 h-full">
                          <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Latest server events</CardDescription>
                          </CardHeader>
                          <CardContent className="p-0">
                            <div className="text-sm">
                              <div className="flex items-center py-3 px-6 border-b border-gray-800 hover:bg-gray-800/30">
                                <div className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mr-4">
                                  <Users className="h-4 w-4" />
                                </div>
                                <div>
                                  <p><span className="font-medium">FluffyTiger</span> joined the server</p>
                                  <p className="text-gray-500 text-xs">5 minutes ago</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center py-3 px-6 border-b border-gray-800 hover:bg-gray-800/30">
                                <div className="h-8 w-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mr-4">
                                  <Command className="h-4 w-4" />
                                </div>
                                <div>
                                  <p><span className="font-medium">WolfLover</span> used <span className="font-mono text-xs bg-gray-800 px-1 rounded">!help</span> command</p>
                                  <p className="text-gray-500 text-xs">12 minutes ago</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center py-3 px-6 border-b border-gray-800 hover:bg-gray-800/30">
                                <div className="h-8 w-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mr-4">
                                  <Shield className="h-4 w-4" />
                                </div>
                                <div>
                                  <p><span className="font-medium">FoxMod</span> warned <span className="font-medium">TroubleUser</span></p>
                                  <p className="text-gray-500 text-xs">35 minutes ago</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center py-3 px-6 hover:bg-gray-800/30">
                                <div className="h-8 w-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mr-4">
                                  <Settings className="h-4 w-4" />
                                </div>
                                <div>
                                  <p><span className="font-medium">ServerOwner</span> updated server settings</p>
                                  <p className="text-gray-500 text-xs">2 hours ago</p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="border-t border-gray-800 py-3">
                            <Button variant="ghost" size="sm" className="w-full text-gray-400">
                              View All Activity
                            </Button>
                          </CardFooter>
                        </Card>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Moderation tab */}
                {activeTab === 'moderation' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold">Moderation Tools</h2>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="border-gray-700">
                              <Shield className="h-4 w-4 mr-2" />
                              New Action
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-gray-900 border-gray-800">
                            <DialogHeader>
                              <DialogTitle>Moderation Action</DialogTitle>
                              <DialogDescription>
                                Take a moderation action against a user
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="username">Discord Username</Label>
                                <Input id="username" placeholder="Enter username or ID" className="bg-gray-800 border-gray-700" />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="action-type">Action Type</Label>
                                <Select>
                                  <SelectTrigger className="bg-gray-800 border-gray-700">
                                    <SelectValue placeholder="Select action type" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-gray-900 border-gray-800">
                                    <SelectItem value="warn">Warn</SelectItem>
                                    <SelectItem value="mute">Mute</SelectItem>
                                    <SelectItem value="kick">Kick</SelectItem>
                                    <SelectItem value="ban">Ban</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="duration">Duration (for mutes)</Label>
                                <div className="flex space-x-2">
                                  <Input id="duration" type="number" placeholder="Duration" className="bg-gray-800 border-gray-700" />
                                  <Select defaultValue="minutes">
                                    <SelectTrigger className="bg-gray-800 border-gray-700 w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-900 border-gray-800">
                                      <SelectItem value="minutes">Minutes</SelectItem>
                                      <SelectItem value="hours">Hours</SelectItem>
                                      <SelectItem value="days">Days</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="reason">Reason</Label>
                                <Textarea id="reason" placeholder="Reason for action" className="bg-gray-800 border-gray-700" />
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Checkbox id="notify" className="data-[state=checked]:bg-indigo-600 border-gray-700" />
                                <Label htmlFor="notify">Notify user via DM</Label>
                              </div>
                            </div>
                            
                            <DialogFooter>
                              <Button variant="outline" className="border-gray-700">Cancel</Button>
                              <Button className="bg-indigo-600 hover:bg-indigo-700">
                                Take Action
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        
                        <Button className="bg-indigo-600 hover:bg-indigo-700">
                          View All Cases
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <Card className="bg-gray-900/70 border-gray-800 col-span-1">
                        <CardHeader>
                          <CardTitle>Moderation Overview</CardTitle>
                          <CardDescription>Quick stats for this server</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-400">Total Cases</div>
                            <div className="font-bold">152</div>
                          </div>
                          
                          <Separator className="bg-gray-800" />
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center text-sm text-red-400">
                                <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                                Bans
                              </div>
                              <div>24</div>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div className="flex items-center text-sm text-orange-400">
                                <div className="h-2 w-2 rounded-full bg-orange-500 mr-2"></div>
                                Kicks
                              </div>
                              <div>18</div>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div className="flex items-center text-sm text-yellow-400">
                                <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></div>
                                Mutes
                              </div>
                              <div>45</div>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div className="flex items-center text-sm text-blue-400">
                                <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                                Warns
                              </div>
                              <div>65</div>
                            </div>
                          </div>
                          
                          <Separator className="bg-gray-800" />
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="text-sm text-gray-400">Active Mutes</div>
                              <div>12</div>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div className="text-sm text-gray-400">Active Bans</div>
                              <div>23</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gray-900/70 border-gray-800 md:col-span-3">
                        <CardHeader>
                          <CardTitle>Recent Moderation Actions</CardTitle>
                          <CardDescription>Latest 10 cases from your server</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="rounded-md border border-gray-800 overflow-hidden">
                            <div className="bg-gray-800/50 px-4 py-2 text-sm font-medium grid grid-cols-12 gap-4">
                              <div className="col-span-1">#</div>
                              <div className="col-span-2">Type</div>
                              <div className="col-span-3">User</div>
                              <div className="col-span-3">Moderator</div>
                              <div className="col-span-3">Reason</div>
                            </div>
                            
                            <div className="divide-y divide-gray-800">
                              {moderationActions?.map((action) => (
                                <div key={action.id} className="px-4 py-3 text-sm grid grid-cols-12 gap-4 hover:bg-gray-800/30">
                                  <div className="col-span-1 font-mono">{action.caseId}</div>
                                  <div className="col-span-2">
                                    <Badge className={`
                                      ${action.type === 'ban' ? 'bg-red-500/20 text-red-300 border-red-500/50' : 
                                        action.type === 'kick' ? 'bg-orange-500/20 text-orange-300 border-orange-500/50' :
                                        action.type === 'mute' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' :
                                        'bg-blue-500/20 text-blue-300 border-blue-500/50'}
                                    `}>
                                      {action.type}
                                    </Badge>
                                  </div>
                                  <div className="col-span-3">UserID: {action.targetDiscordId?.substring(0, 8)}...</div>
                                  <div className="col-span-3">ModID: {action.moderatorDiscordId?.substring(0, 8)}...</div>
                                  <div className="col-span-3 truncate">{action.reason}</div>
                                </div>
                              ))}
                              
                              {(!moderationActions || moderationActions.length === 0) && (
                                <div className="px-4 py-8 text-center text-gray-500">
                                  <Shield className="h-8 w-8 mx-auto mb-2 opacity-40" />
                                  <p>No moderation actions found</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="bg-gray-900/70 border-gray-800">
                        <CardHeader>
                          <CardTitle>Mod Role Management</CardTitle>
                          <CardDescription>Configure roles with moderation permissions</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-md border border-gray-800">
                              <div className="flex items-center">
                                <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                                <span>Admin</span>
                              </div>
                              <div className="flex space-x-2">
                                <Badge variant="outline" className="border-gray-700 bg-gray-800/50">Full Access</Badge>
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-md border border-gray-800">
                              <div className="flex items-center">
                                <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
                                <span>Moderator</span>
                              </div>
                              <div className="flex space-x-2">
                                <Badge variant="outline" className="border-gray-700 bg-gray-800/50">Standard Mod</Badge>
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-md border border-gray-800">
                              <div className="flex items-center">
                                <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                                <span>Helper</span>
                              </div>
                              <div className="flex space-x-2">
                                <Badge variant="outline" className="border-gray-700 bg-gray-800/50">Limited</Badge>
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          <Button variant="outline" className="w-full border-gray-700 mt-2">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Mod Role
                          </Button>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gray-900/70 border-gray-800">
                        <CardHeader>
                          <CardTitle>Punishment Settings</CardTitle>
                          <CardDescription>Configure automated punishment escalation</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="enable-escalation">Enable punishment escalation</Label>
                              <Switch id="enable-escalation" className="data-[state=checked]:bg-indigo-600" />
                            </div>
                            
                            <div className="text-sm text-gray-400">
                              Automatically increase severity of punishments for repeat offenders
                            </div>
                          </div>
                          
                          <Separator className="bg-gray-800" />
                          
                          <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4 items-center">
                              <div className="col-span-1 text-sm">First offense</div>
                              <div className="col-span-2">
                                <Select defaultValue="warn">
                                  <SelectTrigger className="bg-gray-800 border-gray-700">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-gray-900 border-gray-800">
                                    <SelectItem value="warn">Warning</SelectItem>
                                    <SelectItem value="mute">Mute (5m)</SelectItem>
                                    <SelectItem value="kick">Kick</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 items-center">
                              <div className="col-span-1 text-sm">Second offense</div>
                              <div className="col-span-2">
                                <Select defaultValue="mute">
                                  <SelectTrigger className="bg-gray-800 border-gray-700">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-gray-900 border-gray-800">
                                    <SelectItem value="warn">Warning</SelectItem>
                                    <SelectItem value="mute">Mute (15m)</SelectItem>
                                    <SelectItem value="kick">Kick</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 items-center">
                              <div className="col-span-1 text-sm">Third offense</div>
                              <div className="col-span-2">
                                <Select defaultValue="kick">
                                  <SelectTrigger className="bg-gray-800 border-gray-700">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-gray-900 border-gray-800">
                                    <SelectItem value="mute">Mute (1h)</SelectItem>
                                    <SelectItem value="kick">Kick</SelectItem>
                                    <SelectItem value="ban">Ban (1d)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 items-center">
                              <div className="col-span-1 text-sm">Fourth offense</div>
                              <div className="col-span-2">
                                <Select defaultValue="ban">
                                  <SelectTrigger className="bg-gray-800 border-gray-700">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-gray-900 border-gray-800">
                                    <SelectItem value="mute">Mute (24h)</SelectItem>
                                    <SelectItem value="kick">Kick</SelectItem>
                                    <SelectItem value="ban">Ban (Permanent)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                          
                          <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                            Save Settings
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
                
                {/* Auto-moderation tab */}
                {activeTab === 'automod' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold">Auto-Moderation</h2>
                      <div className="flex space-x-2">
                        <Button variant="outline" className="border-gray-700">
                          <Filter className="h-4 w-4 mr-2" />
                          Manage Filters
                        </Button>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="bg-indigo-600 hover:bg-indigo-700">
                              <Plus className="h-4 w-4 mr-2" />
                              New Rule
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-gray-900 border-gray-800">
                            <DialogHeader>
                              <DialogTitle>Create Auto-Mod Rule</DialogTitle>
                              <DialogDescription>
                                Set up a new automated moderation rule
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="rule-name">Rule Name</Label>
                                <Input id="rule-name" placeholder="Enter rule name" className="bg-gray-800 border-gray-700" />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="rule-type">Rule Type</Label>
                                <Select>
                                  <SelectTrigger className="bg-gray-800 border-gray-700">
                                    <SelectValue placeholder="Select rule type" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-gray-900 border-gray-800">
                                    <SelectItem value="word-filter">Word Filter</SelectItem>
                                    <SelectItem value="invites">Discord Invites</SelectItem>
                                    <SelectItem value="links">Links</SelectItem>
                                    <SelectItem value="mention-spam">Mention Spam</SelectItem>
                                    <SelectItem value="spam">Spam Detection</SelectItem>
                                    <SelectItem value="caps">Excessive Caps</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="keywords">Keywords/Patterns</Label>
                                <Textarea id="keywords" placeholder="Enter keywords or regex pattern" className="bg-gray-800 border-gray-700" />
                                <p className="text-xs text-gray-400">For word filters, separate words with commas or use a regex pattern</p>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="action">Action to Take</Label>
                                <Select>
                                  <SelectTrigger className="bg-gray-800 border-gray-700">
                                    <SelectValue placeholder="Select action" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-gray-900 border-gray-800">
                                    <SelectItem value="delete">Delete Message</SelectItem>
                                    <SelectItem value="warn">Warn User</SelectItem>
                                    <SelectItem value="mute">Timeout User</SelectItem>
                                    <SelectItem value="kick">Kick User</SelectItem>
                                    <SelectItem value="ban">Ban User</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Checkbox id="delete-msg" defaultChecked className="data-[state=checked]:bg-indigo-600 border-gray-700" />
                                  <Label htmlFor="delete-msg">Delete Message</Label>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Checkbox id="notify-user" defaultChecked className="data-[state=checked]:bg-indigo-600 border-gray-700" />
                                  <Label htmlFor="notify-user">Notify User</Label>
                                </div>
                              </div>
                            </div>
                            
                            <DialogFooter>
                              <Button variant="outline" className="border-gray-700">Cancel</Button>
                              <Button className="bg-indigo-600 hover:bg-indigo-700">
                                Create Rule
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    
                    <Card className="bg-gray-900/70 border-gray-800">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle>Auto-Moderation Rules</CardTitle>
                            <CardDescription>Active rules that automatically moderate your server</CardDescription>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-sm text-gray-400">System Status:</div>
                            <Badge className="bg-green-500/20 text-green-300 border-green-500/50">
                              <CheckCircle className="h-3 w-3 mr-1" /> Active
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {autoModRules?.map(rule => (
                            <div 
                              key={rule.id}
                              className="bg-gray-800/30 rounded-md border border-gray-800 overflow-hidden"
                            >
                              <div className="p-4 flex justify-between items-center">
                                <div className="flex items-center">
                                  <div className="mr-3">
                                    <Switch 
                                      id={`rule-${rule.id}`}
                                      checked={rule.enabled}
                                      onCheckedChange={() => toggleAutoModRule(rule.id)}
                                      className="data-[state=checked]:bg-indigo-600" 
                                    />
                                  </div>
                                  <div>
                                    <h3 className="font-medium">{rule.name}</h3>
                                    <p className="text-sm text-gray-400">Type: {rule.type}</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Badge className="bg-gray-800/70 text-gray-300 border-gray-600">
                                    {rule.action?.toUpperCase()}
                                    {rule.duration && ` (${rule.duration}s)`}
                                  </Badge>
                                  
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  
                                  <Collapsible>
                                    <CollapsibleTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <ChevronDown className="h-4 w-4" />
                                      </Button>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="p-4 pt-0 bg-gray-800/30">
                                      <div className="mt-2 space-y-2 text-sm">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <p className="text-gray-400">Settings:</p>
                                            <ul className="list-disc list-inside mt-1 text-xs space-y-1">
                                              {rule.settings?.deleteMessage && <li>Delete offending message</li>}
                                              {rule.settings?.notifyUser && <li>Notify user when triggered</li>}
                                              {rule.settings?.regex && <li>Pattern: {rule.settings.regex}</li>}
                                              {rule.settings?.whitelistedChannels?.length && <li>{rule.settings.whitelistedChannels.length} exempt channels</li>}
                                              {rule.settings?.whitelistedRoles?.length && <li>{rule.settings.whitelistedRoles.length} exempt roles</li>}
                                            </ul>
                                          </div>
                                          <div>
                                            <p className="text-gray-400">Statistics:</p>
                                            <ul className="list-disc list-inside mt-1 text-xs space-y-1">
                                              <li>Triggered 34 times this week</li>
                                              <li>Last triggered: 2 hours ago</li>
                                            </ul>
                                          </div>
                                        </div>
                                        
                                        <div className="flex justify-end mt-4">
                                          <Button variant="outline" size="sm" className="border-gray-700 mr-2">
                                            <Edit className="h-3 w-3 mr-1" /> Edit
                                          </Button>
                                          <Button variant="destructive" size="sm">
                                            <Trash2 className="h-3 w-3 mr-1" /> Delete
                                          </Button>
                                        </div>
                                      </div>
                                    </CollapsibleContent>
                                  </Collapsible>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {(!autoModRules || autoModRules.length === 0) && (
                            <div className="p-8 text-center text-gray-500 border border-gray-800 rounded-md">
                              <Filter className="h-10 w-10 mx-auto mb-3 opacity-40" />
                              <p className="text-lg font-medium">No auto-mod rules configured</p>
                              <p className="text-sm">Create rules to automatically moderate your server</p>
                              <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700">
                                <Plus className="h-4 w-4 mr-2" />
                                Create First Rule
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="bg-gray-900/70 border-gray-800">
                        <CardHeader>
                          <CardTitle>Auto-Moderation Log</CardTitle>
                          <CardDescription>Recent automatic actions taken</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm">
                            <div className="flex items-center py-3 px-4 border-b border-gray-800 hover:bg-gray-800/30">
                              <div className="h-8 w-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mr-4">
                                <Trash2 className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <p>Auto-deleted a message containing a banned invite</p>
                                <p className="text-gray-500 text-xs">45 minutes ago • #general</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center py-3 px-4 border-b border-gray-800 hover:bg-gray-800/30">
                              <div className="h-8 w-8 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center mr-4">
                                <Shield className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <p>Auto-warned <span className="font-medium">SpamUser123</span> for excessive mentions</p>
                                <p className="text-gray-500 text-xs">2 hours ago • #welcome</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center py-3 px-4 hover:bg-gray-800/30">
                              <div className="h-8 w-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center mr-4">
                                <Shield className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <p>Auto-muted <span className="font-medium">BadWord431</span> for using banned words</p>
                                <p className="text-gray-500 text-xs">5 hours ago • #chat</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="border-t border-gray-800 py-3">
                          <Button variant="ghost" size="sm" className="w-full text-gray-400">
                            View Full Log
                          </Button>
                        </CardFooter>
                      </Card>
                      
                      <Card className="bg-gray-900/70 border-gray-800">
                        <CardHeader>
                          <CardTitle>Auto-Mod Settings</CardTitle>
                          <CardDescription>Global configuration for auto-moderation</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <Label htmlFor="log-channel">Log Channel</Label>
                                <p className="text-sm text-gray-400">Where to send auto-mod logs</p>
                              </div>
                              <Select defaultValue="mod-logs">
                                <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-900 border-gray-800">
                                  <SelectItem value="mod-logs">#mod-logs</SelectItem>
                                  <SelectItem value="bot-logs">#bot-logs</SelectItem>
                                  <SelectItem value="admin">#admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div>
                                <Label htmlFor="mute-role">Mute Role</Label>
                                <p className="text-sm text-gray-400">Role applied when muting users</p>
                              </div>
                              <Select defaultValue="muted">
                                <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-900 border-gray-800">
                                  <SelectItem value="muted">@Muted</SelectItem>
                                  <SelectItem value="timeout">@Timeout</SelectItem>
                                  <SelectItem value="none">None (Use Timeouts)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <Separator className="bg-gray-800" />
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="notify-mods">Notify moderators</Label>
                                <Switch id="notify-mods" className="data-[state=checked]:bg-indigo-600" />
                              </div>
                              <p className="text-xs text-gray-400">Send a notification to online moderators when auto-mod takes action</p>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="case-creation">Create cases for auto-actions</Label>
                                <Switch id="case-creation" defaultChecked className="data-[state=checked]:bg-indigo-600" />
                              </div>
                              <p className="text-xs text-gray-400">Generate moderation case entries for auto-mod actions</p>
                            </div>
                          </div>
                          
                          <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                            <Save className="h-4 w-4 mr-2" />
                            Save Settings
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
                
                {/* Custom commands tab */}
                {activeTab === 'commands' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold">Custom Commands</h2>
                      <div className="flex space-x-2">
                        <Input 
                          placeholder="Search commands..." 
                          className="w-60 bg-gray-800 border-gray-700" 
                        />
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="bg-indigo-600 hover:bg-indigo-700">
                              <Plus className="h-4 w-4 mr-2" />
                              New Command
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-gray-900 border-gray-800">
                            <DialogHeader>
                              <DialogTitle>Create Custom Command</DialogTitle>
                              <DialogDescription>
                                Add a new custom command to your server
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="command-name">Command Name</Label>
                                <Input id="command-name" placeholder="Enter command name" className="bg-gray-800 border-gray-700" />
                                <p className="text-xs text-gray-400">Users will trigger this with: "{selectedGuild?.settings?.prefix || '>'}commandname"</p>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="command-response">Command Response</Label>
                                <Textarea 
                                  id="command-response" 
                                  placeholder="Enter the response the bot will send" 
                                  className="bg-gray-800 border-gray-700 min-h-[150px]" 
                                />
                                <div className="text-xs text-gray-400 space-y-1">
                                  <p>You can use these placeholders:</p>
                                  <p><code className="bg-gray-800 px-1 rounded">{'{user}'}</code> - Mentions the user who ran the command</p>
                                  <p><code className="bg-gray-800 px-1 rounded">{'{server}'}</code> - The server name</p>
                                  <p><code className="bg-gray-800 px-1 rounded">{'{count}'}</code> - Number of server members</p>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Checkbox id="embed-response" className="data-[state=checked]:bg-indigo-600 border-gray-700" />
                                  <Label htmlFor="embed-response">Send as an embed</Label>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Checkbox id="restricted-cmd" className="data-[state=checked]:bg-indigo-600 border-gray-700" />
                                  <Label htmlFor="restricted-cmd">Mod-only command</Label>
                                </div>
                              </div>
                            </div>
                            
                            <DialogFooter>
                              <Button variant="outline" className="border-gray-700">Cancel</Button>
                              <Button className="bg-indigo-600 hover:bg-indigo-700">
                                Create Command
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    
                    <Card className="bg-gray-900/70 border-gray-800">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle>Custom Commands List</CardTitle>
                            <CardDescription>Commands users can trigger in your server</CardDescription>
                          </div>
                          <div className="text-sm text-gray-400">
                            Prefix: <code className="bg-gray-800 px-1 rounded">{selectedGuild?.settings?.prefix || '>'}</code>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-md border border-gray-800 overflow-hidden">
                          <div className="bg-gray-800/50 px-4 py-2 text-sm font-medium grid grid-cols-12 gap-4">
                            <div className="col-span-2">Command</div>
                            <div className="col-span-6">Response</div>
                            <div className="col-span-2">Usage Count</div>
                            <div className="col-span-2 text-right">Actions</div>
                          </div>
                          
                          <div className="divide-y divide-gray-800">
                            {customCommands?.map(command => (
                              <div key={command.id} className="px-4 py-3 text-sm grid grid-cols-12 gap-4 hover:bg-gray-800/30">
                                <div className="col-span-2 font-medium">
                                  {selectedGuild?.settings?.prefix || '>'}{command.name}
                                </div>
                                <div className="col-span-6 text-gray-300 truncate">
                                  {command.response}
                                </div>
                                <div className="col-span-2 text-gray-400">
                                  {command.usageCount?.toLocaleString() || 0} uses
                                </div>
                                <div className="col-span-2 flex justify-end space-x-1">
                                  <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <Edit className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                    onClick={() => deleteCustomCommand(command.id)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                            
                            {(!customCommands || customCommands.length === 0) && (
                              <div className="px-4 py-8 text-center text-gray-500">
                                <Command className="h-8 w-8 mx-auto mb-2 opacity-40" />
                                <p>No custom commands found</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="bg-gray-900/70 border-gray-800">
                        <CardHeader>
                          <CardTitle>Command Categories</CardTitle>
                          <CardDescription>Organize your custom commands</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-md border border-gray-800">
                              <div className="flex items-center space-x-2">
                                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                                <span>Information</span>
                              </div>
                              <Badge variant="outline" className="border-gray-700 bg-gray-800/50">5 commands</Badge>
                            </div>
                            
                            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-md border border-gray-800">
                              <div className="flex items-center space-x-2">
                                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                <span>Fun</span>
                              </div>
                              <Badge variant="outline" className="border-gray-700 bg-gray-800/50">12 commands</Badge>
                            </div>
                            
                            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-md border border-gray-800">
                              <div className="flex items-center space-x-2">
                                <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                                <span>Utility</span>
                              </div>
                              <Badge variant="outline" className="border-gray-700 bg-gray-800/50">7 commands</Badge>
                            </div>
                          </div>
                          
                          <Button variant="outline" className="w-full border-gray-700 mt-2">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Category
                          </Button>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gray-900/70 border-gray-800">
                        <CardHeader>
                          <CardTitle>Command Settings</CardTitle>
                          <CardDescription>Global command configuration</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="command-prefix">Command Prefix</Label>
                              <div className="flex space-x-2">
                                <Input 
                                  id="command-prefix" 
                                  value={selectedGuild?.settings?.prefix || '>'} 
                                  className="w-20 bg-gray-800 border-gray-700 text-center font-mono" 
                                />
                                <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                                  Change Prefix
                                </Button>
                              </div>
                              <p className="text-xs text-gray-400">The character(s) that trigger your bot's commands</p>
                            </div>
                            
                            <Separator className="bg-gray-800" />
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="cooldowns">Command Cooldowns</Label>
                                <Switch id="cooldowns" className="data-[state=checked]:bg-indigo-600" />
                              </div>
                              <p className="text-xs text-gray-400">Prevent command spam by adding cooldowns</p>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="delete-commands">Delete command triggers</Label>
                                <Switch id="delete-commands" className="data-[state=checked]:bg-indigo-600" />
                              </div>
                              <p className="text-xs text-gray-400">Remove the user's command message after it's processed</p>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="case-insensitive">Case insensitive commands</Label>
                                <Switch id="case-insensitive" defaultChecked className="data-[state=checked]:bg-indigo-600" />
                              </div>
                              <p className="text-xs text-gray-400">Allow commands to be typed in any capitalization</p>
                            </div>
                          </div>
                          
                          <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                            <Save className="h-4 w-4 mr-2" />
                            Save Settings
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
                
                {/* Logs tab */}
                {activeTab === 'logs' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold">Server Logs</h2>
                      <div className="flex space-x-2">
                        <Button variant="outline" className="border-gray-700">
                          <Filter className="h-4 w-4 mr-2" />
                          Filter Logs
                        </Button>
                        <Button className="bg-indigo-600 hover:bg-indigo-700">
                          <Server className="h-4 w-4 mr-2" />
                          Configure Logging
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <Card className="bg-gray-900/70 border-gray-800 col-span-1">
                        <CardHeader>
                          <CardTitle>Log Categories</CardTitle>
                          <CardDescription>Select which logs to view</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="log-message" defaultChecked className="data-[state=checked]:bg-indigo-600 border-gray-700" />
                            <Label htmlFor="log-message">Message Logs</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox id="log-member" defaultChecked className="data-[state=checked]:bg-indigo-600 border-gray-700" />
                            <Label htmlFor="log-member">Member Logs</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox id="log-mod" defaultChecked className="data-[state=checked]:bg-indigo-600 border-gray-700" />
                            <Label htmlFor="log-mod">Moderation Logs</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox id="log-voice" className="data-[state=checked]:bg-indigo-600 border-gray-700" />
                            <Label htmlFor="log-voice">Voice Logs</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox id="log-server" className="data-[state=checked]:bg-indigo-600 border-gray-700" />
                            <Label htmlFor="log-server">Server Logs</Label>
                          </div>
                          
                          <Separator className="bg-gray-800 my-3" />
                          
                          <div className="space-y-2">
                            <Label htmlFor="date-range">Date Range</Label>
                            <Select defaultValue="today">
                              <SelectTrigger className="bg-gray-800 border-gray-700">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-900 border-gray-800">
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="24h">Last 24 hours</SelectItem>
                                <SelectItem value="week">This week</SelectItem>
                                <SelectItem value="month">This month</SelectItem>
                                <SelectItem value="custom">Custom range</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2 mt-4">
                            <Label htmlFor="search-logs">Search Logs</Label>
                            <div className="relative">
                              <Input 
                                id="search-logs" 
                                placeholder="Search logs..." 
                                className="bg-gray-800 border-gray-700 pl-9" 
                              />
                              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            </div>
                          </div>
                          
                          <Button className="w-full mt-4">
                            Apply Filters
                          </Button>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gray-900/70 border-gray-800 md:col-span-3">
                        <CardHeader>
                          <CardTitle>Server Log Entries</CardTitle>
                          <CardDescription>Most recent 100 log entries</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                            <div className="p-3 bg-gray-800/30 rounded-md border border-gray-800 hover:bg-gray-800/50">
                              <div className="flex items-center justify-between mb-1">
                                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/50">Member Join</Badge>
                                <span className="text-xs text-gray-400">Today, 2:45 PM</span>
                              </div>
                              <p className="text-sm">User <span className="font-semibold">FluffyTiger#1234</span> joined the server</p>
                              <p className="text-xs text-gray-400 mt-1">User ID: 123456789012345678</p>
                            </div>
                            
                            <div className="p-3 bg-gray-800/30 rounded-md border border-gray-800 hover:bg-gray-800/50">
                              <div className="flex items-center justify-between mb-1">
                                <Badge className="bg-red-500/20 text-red-300 border-red-500/50">Message Delete</Badge>
                                <span className="text-xs text-gray-400">Today, 2:30 PM</span>
                              </div>
                              <p className="text-sm">Message by <span className="font-semibold">WolfLover#5678</span> was deleted in <span className="text-gray-300">#general</span></p>
                              <div className="mt-1 p-2 bg-gray-900 rounded text-xs">
                                <p className="text-gray-400">Message content: "Hello everyone! How are you doing today?"</p>
                              </div>
                            </div>
                            
                            <div className="p-3 bg-gray-800/30 rounded-md border border-gray-800 hover:bg-gray-800/50">
                              <div className="flex items-center justify-between mb-1">
                                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50">Command Use</Badge>
                                <span className="text-xs text-gray-400">Today, 2:15 PM</span>
                              </div>
                              <p className="text-sm"><span className="font-semibold">FoxMod#8765</span> used command <code className="bg-gray-800 px-1 rounded text-xs">!warn</code> in <span className="text-gray-300">#general</span></p>
                              <div className="mt-1 p-2 bg-gray-900 rounded text-xs">
                                <p className="text-gray-400">Target: <span className="text-gray-300">TroubleUser#4321</span> | Reason: Spamming in channel</p>
                              </div>
                            </div>
                            
                            <div className="p-3 bg-gray-800/30 rounded-md border border-gray-800 hover:bg-gray-800/50">
                              <div className="flex items-center justify-between mb-1">
                                <Badge className="bg-green-500/20 text-green-300 border-green-500/50">Role Update</Badge>
                                <span className="text-xs text-gray-400">Today, 1:52 PM</span>
                              </div>
                              <p className="text-sm">Role <span className="font-semibold">@Active Member</span> was added to <span className="font-semibold">WolfLover#5678</span></p>
                              <p className="text-xs text-gray-400 mt-1">By: <span className="text-gray-300">ServerOwner#0001</span></p>
                            </div>
                            
                            <div className="p-3 bg-gray-800/30 rounded-md border border-gray-800 hover:bg-gray-800/50">
                              <div className="flex items-center justify-between mb-1">
                                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50">Voice Update</Badge>
                                <span className="text-xs text-gray-400">Today, 1:30 PM</span>
                              </div>
                              <p className="text-sm"><span className="font-semibold">FluffyTiger#1234</span> joined voice channel <span className="text-gray-300">#general-voice</span></p>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="border-t border-gray-800 flex justify-between">
                          <div className="text-sm text-gray-400">
                            Showing 5 of 142 log entries
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="border-gray-700">Previous</Button>
                            <Button variant="outline" size="sm" className="border-gray-700">Next</Button>
                          </div>
                        </CardFooter>
                      </Card>
                    </div>
                    
                    <Card className="bg-gray-900/70 border-gray-800">
                      <CardHeader>
                        <CardTitle>Log Settings</CardTitle>
                        <CardDescription>Configure what events are logged and where</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-4">
                            <h3 className="font-medium">Message Logs</h3>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="log-msg-delete">Message Deletions</Label>
                                <Switch id="log-msg-delete" defaultChecked className="data-[state=checked]:bg-indigo-600" />
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <Label htmlFor="log-msg-edit">Message Edits</Label>
                                <Switch id="log-msg-edit" defaultChecked className="data-[state=checked]:bg-indigo-600" />
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <Label htmlFor="log-msg-bulk">Bulk Deletions</Label>
                                <Switch id="log-msg-bulk" defaultChecked className="data-[state=checked]:bg-indigo-600" />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="msg-log-channel">Log Channel</Label>
                              <Select defaultValue="message-logs">
                                <SelectTrigger className="bg-gray-800 border-gray-700">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-900 border-gray-800">
                                  <SelectItem value="message-logs">#message-logs</SelectItem>
                                  <SelectItem value="bot-logs">#bot-logs</SelectItem>
                                  <SelectItem value="general-logs">#general-logs</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <h3 className="font-medium">Member Logs</h3>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="log-join">Member Joins</Label>
                                <Switch id="log-join" defaultChecked className="data-[state=checked]:bg-indigo-600" />
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <Label htmlFor="log-leave">Member Leaves</Label>
                                <Switch id="log-leave" defaultChecked className="data-[state=checked]:bg-indigo-600" />
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <Label htmlFor="log-nick">Nickname Changes</Label>
                                <Switch id="log-nick" defaultChecked className="data-[state=checked]:bg-indigo-600" />
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <Label htmlFor="log-role">Role Changes</Label>
                                <Switch id="log-role" defaultChecked className="data-[state=checked]:bg-indigo-600" />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="member-log-channel">Log Channel</Label>
                              <Select defaultValue="member-logs">
                                <SelectTrigger className="bg-gray-800 border-gray-700">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-900 border-gray-800">
                                  <SelectItem value="member-logs">#member-logs</SelectItem>
                                  <SelectItem value="bot-logs">#bot-logs</SelectItem>
                                  <SelectItem value="general-logs">#general-logs</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <h3 className="font-medium">Other Logs</h3>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="log-voice">Voice Activity</Label>
                                <Switch id="log-voice" className="data-[state=checked]:bg-indigo-600" />
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <Label htmlFor="log-invite">Invite Creates/Uses</Label>
                                <Switch id="log-invite" className="data-[state=checked]:bg-indigo-600" />
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <Label htmlFor="log-emoji">Emoji Updates</Label>
                                <Switch id="log-emoji" className="data-[state=checked]:bg-indigo-600" />
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <Label htmlFor="log-command">Command Usage</Label>
                                <Switch id="log-command" defaultChecked className="data-[state=checked]:bg-indigo-600" />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="other-log-channel">Log Channel</Label>
                              <Select defaultValue="bot-logs">
                                <SelectTrigger className="bg-gray-800 border-gray-700">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-900 border-gray-800">
                                  <SelectItem value="bot-logs">#bot-logs</SelectItem>
                                  <SelectItem value="general-logs">#general-logs</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        
                        <Button className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700">
                          <Save className="h-4 w-4 mr-2" />
                          Save Log Settings
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                {/* Server settings tab */}
                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold">Server Settings</h2>
                      <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={saveServerSettings}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className="bg-gray-900/70 border-gray-800 md:col-span-2">
                        <CardHeader>
                          <CardTitle>General Settings</CardTitle>
                          <CardDescription>Basic configuration for your server</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="prefix">Command Prefix</Label>
                              <div className="flex">
                                <Input 
                                  id="prefix" 
                                  value={selectedGuild?.settings?.prefix || '>'} 
                                  className="max-w-[100px] bg-gray-800 border-gray-700" 
                                />
                              </div>
                              <p className="text-xs text-gray-400">The character that triggers bot commands</p>
                            </div>
                          </div>
                          
                          <Separator className="bg-gray-800" />
                          
                          <div className="space-y-2">
                            <h3 className="text-sm font-medium">Welcome Configuration</h3>
                            
                            <div className="flex items-center justify-between mb-2">
                              <Label htmlFor="welcome-enabled">Enable welcome messages</Label>
                              <Switch 
                                id="welcome-enabled" 
                                checked={!!selectedGuild?.settings?.welcomeMessage}
                                className="data-[state=checked]:bg-indigo-600" 
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="welcome-channel">Welcome Channel</Label>
                              <Select value={selectedGuild?.settings?.welcomeChannelId || ''}>
                                <SelectTrigger className="bg-gray-800 border-gray-700">
                                  <SelectValue placeholder="Select channel" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-900 border-gray-800">
                                  <SelectItem value="123456789012345679">#welcome</SelectItem>
                                  <SelectItem value="123456789012345680">#general</SelectItem>
                                  <SelectItem value="123456789012345681">#lobby</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2 mt-4">
                              <Label htmlFor="welcome-message">Welcome Message</Label>
                              <Textarea 
                                id="welcome-message" 
                                value={selectedGuild?.settings?.welcomeMessage || ''} 
                                placeholder="Enter welcome message..." 
                                className="bg-gray-800 border-gray-700 min-h-[100px]" 
                              />
                              <div className="text-xs text-gray-400 space-y-1">
                                <p>You can use these placeholders:</p>
                                <p><code className="bg-gray-800 px-1 rounded">{'{user}'}</code> - Mentions the user</p>
                                <p><code className="bg-gray-800 px-1 rounded">{'{server}'}</code> - The server name</p>
                                <p><code className="bg-gray-800 px-1 rounded">{'{count}'}</code> - Member count</p>
                              </div>
                            </div>
                          </div>
                          
                          <Separator className="bg-gray-800" />
                          
                          <div className="space-y-2">
                            <h3 className="text-sm font-medium">Leave Configuration</h3>
                            
                            <div className="flex items-center justify-between mb-2">
                              <Label htmlFor="leave-enabled">Enable leave messages</Label>
                              <Switch 
                                id="leave-enabled" 
                                checked={!!selectedGuild?.settings?.leaveMessage}
                                className="data-[state=checked]:bg-indigo-600" 
                              />
                            </div>
                            
                            <div className="space-y-2 mt-4">
                              <Label htmlFor="leave-message">Leave Message</Label>
                              <Textarea 
                                id="leave-message" 
                                value={selectedGuild?.settings?.leaveMessage || ''} 
                                placeholder="Enter leave message..." 
                                className="bg-gray-800 border-gray-700" 
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <div className="space-y-6">
                        <Card className="bg-gray-900/70 border-gray-800">
                          <CardHeader>
                            <CardTitle>Role Management</CardTitle>
                            <CardDescription>Manage automated roles</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between mb-2">
                                <Label htmlFor="autorole-enabled">Auto-role on join</Label>
                                <Switch 
                                  id="autorole-enabled" 
                                  checked={!!selectedGuild?.settings?.autoRoleId}
                                  className="data-[state=checked]:bg-indigo-600" 
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="autorole">Auto-assign Role</Label>
                                <Select value={selectedGuild?.settings?.autoRoleId || ''}>
                                  <SelectTrigger className="bg-gray-800 border-gray-700">
                                    <SelectValue placeholder="Select role" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-gray-900 border-gray-800">
                                    <SelectItem value="123456789012345681">@Member</SelectItem>
                                    <SelectItem value="223456789012345682">@New User</SelectItem>
                                    <SelectItem value="323456789012345683">@Visitor</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            <Separator className="bg-gray-800" />
                            
                            <div className="space-y-2">
                              <Label htmlFor="mute-role">Mute Role</Label>
                              <Select value={selectedGuild?.settings?.muteRoleId || ''}>
                                <SelectTrigger className="bg-gray-800 border-gray-700">
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-900 border-gray-800">
                                  <SelectItem value="123456789012345682">@Muted</SelectItem>
                                  <SelectItem value="223456789012345683">@Timeout</SelectItem>
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-gray-400">Role applied when muting users</p>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-gray-900/70 border-gray-800">
                          <CardHeader>
                            <CardTitle>Advanced Settings</CardTitle>
                            <CardDescription>Additional bot configuration</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="moderation-enabled">Moderation Module</Label>
                                <Switch 
                                  id="moderation-enabled" 
                                  checked={selectedGuild?.settings?.moderationEnabled}
                                  className="data-[state=checked]:bg-indigo-600" 
                                />
                              </div>
                              <p className="text-xs text-gray-400">Enable moderation commands and logs</p>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="log-channel">Main Log Channel</Label>
                              <Select value={selectedGuild?.settings?.logChannelId || ''}>
                                <SelectTrigger className="bg-gray-800 border-gray-700">
                                  <SelectValue placeholder="Select channel" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-900 border-gray-800">
                                  <SelectItem value="123456789012345680">#mod-logs</SelectItem>
                                  <SelectItem value="223456789012345681">#bot-logs</SelectItem>
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-gray-400">Default channel for bot logging</p>
                            </div>
                            
                            <Separator className="bg-gray-800" />
                            
                            <div className="space-y-2">
                              <Button variant="destructive" className="w-full">
                                Reset All Bot Settings
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="h-[80vh] flex flex-col items-center justify-center">
                <div className="text-center space-y-4">
                  <Server className="h-16 w-16 mx-auto text-gray-500 mb-4" />
                  <h2 className="text-2xl font-bold">No Server Selected</h2>
                  <p className="text-gray-400 max-w-md">
                    Select a server from the sidebar or add the bot to a new server
                  </p>
                  <Button className="mt-6 bg-indigo-600 hover:bg-indigo-700">
                    Add to Server
                  </Button>
                </div>
              </div>
            )}
            
            {/* Help & resources card */}
            <div className="fixed bottom-6 right-6">
              <Collapsible>
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full p-3 shadow-lg cursor-pointer">
                  <CollapsibleTrigger asChild>
                    <HelpCircle className="h-6 w-6 text-white" />
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="absolute bottom-12 right-0 w-64 bg-gray-900 border border-gray-800 rounded-md shadow-xl p-4">
                  <h3 className="font-bold mb-2">Need Help?</h3>
                  <p className="text-sm text-gray-300 mb-4">
                    Check out the resources below for help with setting up your bot.
                  </p>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full border-gray-700 justify-start">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Documentation
                    </Button>
                    <Button variant="outline" size="sm" className="w-full border-gray-700 justify-start">
                      <LifeBuoy className="h-4 w-4 mr-2" />
                      Support
                    </Button>
                    <Button variant="outline" size="sm" className="w-full border-gray-700 justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Community
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// Additional components imports for help button
import { BookOpen, LifeBuoy } from 'lucide-react';