import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, User, LogOut, Menu, X } from "lucide-react";

export function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="bg-black border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and desktop navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <a className="text-white font-bold text-xl">essence</a>
              </Link>
            </div>
            
            {/* Desktop nav links */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4 items-center">
              <Link href="/">
                <a className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Home
                </a>
              </Link>
              
              {user && (
                <Link href="/dashboard">
                  <a className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                    Dashboard
                  </a>
                </Link>
              )}
              
              <Link href="/#features">
                <a className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Features
                </a>
              </Link>
              
              <Link href="/#commands">
                <a className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Commands
                </a>
              </Link>
            </div>
          </div>
          
          {/* Profile section */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                    <User className="h-5 w-5 mr-2" />
                    {user.username}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <a className="w-full cursor-pointer">Dashboard</a>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600 cursor-pointer"
                    onClick={handleLogout} 
                    disabled={logoutMutation.isPending}
                  >
                    {logoutMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging out...
                      </>
                    ) : (
                      <>
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  Login
                </Button>
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="text-gray-400 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-gray-900 border-t border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/">
              <a className="text-gray-300 hover:bg-gray-800 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                Home
              </a>
            </Link>
            
            {user && (
              <Link href="/dashboard">
                <a className="text-gray-300 hover:bg-gray-800 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                  Dashboard
                </a>
              </Link>
            )}
            
            <Link href="/#features">
              <a className="text-gray-300 hover:bg-gray-800 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                Features
              </a>
            </Link>
            
            <Link href="/#commands">
              <a className="text-gray-300 hover:bg-gray-800 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                Commands
              </a>
            </Link>
            
            {user ? (
              <button
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="w-full text-left text-red-500 hover:bg-gray-800 hover:text-red-400 block px-3 py-2 rounded-md text-base font-medium"
              >
                {logoutMutation.isPending ? "Logging out..." : "Log out"}
              </button>
            ) : (
              <Link href="/auth">
                <a className="bg-indigo-600 hover:bg-indigo-700 text-white block px-3 py-2 rounded-md text-base font-medium">
                  Login
                </a>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}