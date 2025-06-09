import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Reply, 
  FileText, 
  Edit, 
  Save, 
  Settings, 
  Menu, 
  X,
  User,
  ChevronDown,
  Bell,
  Zap,
  LogOut,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import LoadingSpinner from '@/components/LoadingSpinner';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();

  // If loading, show loading spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  // If no user, redirect to login
  if (!user) {
    navigate('/login');
    return null;
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'DM Generator', href: '/dashboard/dm-generator', icon: MessageSquare },
    { name: 'Reply Generator', href: '/dashboard/reply-generator', icon: Reply },
    { name: 'Thread Generator', href: '/dashboard/thread-generator', icon: FileText },
    { name: 'Post Generator', href: '/dashboard/post-generator', icon: Sparkles },
    { name: 'Thread Rewriter', href: '/dashboard/thread-rewriter', icon: Edit },
    { name: 'Saved Content', href: '/dashboard/saved-content', icon: Save },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'pro': return 'bg-blue-600';
      case 'business': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-25 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-gray-200",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <img src="/favicon.svg" alt="SparkReply Logo" className="w-8 h-8" />
            </div>
            <span className="text-gray-900 font-semibold text-lg">SparkReply</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-gray-600 hover:text-gray-900"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="mt-6 px-3">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2 mb-1 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top navbar */}
        <header className="bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-gray-600 hover:text-gray-900"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            <div className="flex items-center space-x-4">
              {/* Usage stats */}
              <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Zap className="w-4 h-4" />
                  <span>42/100 generations used</span>
                </div>
                <div className={`${getPlanBadgeColor(user?.plan_tier || 'starter')} text-white px-2 py-1 rounded text-xs capitalize`}>
                  {user?.plan_tier || 'Starter'} Plan
                </div>
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
                <Bell className="w-5 h-5" />
              </Button>

              {/* Profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-100">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block text-sm text-gray-900">{user?.name || user?.email?.split('@')[0] || 'User'}</span>
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white border-gray-200">
                  <DropdownMenuLabel className="text-gray-900">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.name || 'User'}</p>
                      <p className="text-xs text-gray-600">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-200" />
                  <DropdownMenuItem asChild className="text-gray-700 hover:bg-gray-100">
                    <Link to="/dashboard/settings" className="flex items-center">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-gray-700 hover:bg-gray-100">
                    <Link to="/dashboard/saved-content" className="flex items-center">
                      <Save className="w-4 h-4 mr-2" />
                      Saved Content
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200" />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-red-400 hover:bg-gray-100 hover:text-red-300"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
