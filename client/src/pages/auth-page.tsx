import { useState } from 'react';
import { useAuth, loginSchema, registerSchema } from '@/hooks/use-auth';
import { Redirect } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { user, loginMutation, registerMutation } = useAuth();
  
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });
  
  const onLoginSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };
  
  const onRegisterSubmit = (values: RegisterFormValues) => {
    registerMutation.mutate(values);
  };
  
  // Redirect to dashboard if already logged in
  if (user) {
    return <Redirect to="/dashboard" />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-6 items-center">
        {/* Auth Form */}
        <div>
          <Card className="w-full max-w-md mx-auto bg-gray-900/80 border-gray-800">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">essence Dashboard</CardTitle>
              <CardDescription>
                Login or create an account to manage your Discord bot
              </CardDescription>
            </CardHeader>
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 m-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              {/* Login Tab */}
              <TabsContent value="login" className="px-4 pb-6">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your username" 
                              {...field}
                              className="bg-gray-800 border-gray-700" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Enter your password" 
                              {...field}
                              className="bg-gray-800 border-gray-700" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-indigo-600 hover:bg-indigo-700"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        "Login"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              {/* Register Tab */}
              <TabsContent value="register" className="px-4 pb-6">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Choose a username" 
                              {...field}
                              className="bg-gray-800 border-gray-700" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Choose a password" 
                              {...field}
                              className="bg-gray-800 border-gray-700" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Confirm your password" 
                              {...field}
                              className="bg-gray-800 border-gray-700" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-indigo-600 hover:bg-indigo-700"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
            
            <CardFooter className="flex justify-center pt-2 pb-6 text-sm text-gray-400">
              <p>
                Don't have a Discord bot yet?{" "}
                <a href="/" className="text-indigo-400 hover:text-indigo-300">
                  Add essence to your server
                </a>
              </p>
            </CardFooter>
          </Card>
        </div>
        
        {/* Hero Section */}
        <div className="hidden md:flex flex-col items-center justify-center text-center p-8 rounded-xl bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-800 shadow-2xl h-[600px]">
          <h1 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Welcome to essence Dashboard
          </h1>
          <p className="text-lg text-gray-300 mb-8 max-w-md">
            Your all-in-one furro bot dashboard for Discord server management, moderation, and customization.
          </p>
          
          <div className="grid grid-cols-2 gap-6 w-full max-w-md">
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 text-left">
              <h3 className="font-medium mb-2">Server Management</h3>
              <p className="text-sm text-gray-400">Configure welcome messages, auto-roles, and more</p>
            </div>
            
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 text-left">
              <h3 className="font-medium mb-2">Moderation Tools</h3>
              <p className="text-sm text-gray-400">Keep your server safe with advanced moderation</p>
            </div>
            
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 text-left">
              <h3 className="font-medium mb-2">Custom Commands</h3>
              <p className="text-sm text-gray-400">Create custom responses for your server</p>
            </div>
            
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 text-left">
              <h3 className="font-medium mb-2">Detailed Logs</h3>
              <p className="text-sm text-gray-400">Track all activity in your Discord server</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}