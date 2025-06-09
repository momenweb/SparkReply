import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, 
  Reply, 
  FileText, 
  Edit, 
  TrendingUp, 
  Zap,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

const Dashboard = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const shortcuts = [
    { name: 'Generate DM', href: '/dashboard/dm-generator', icon: MessageSquare, color: 'bg-blue-100' },
    { name: 'Smart Reply', href: '/dashboard/reply-generator', icon: Reply, color: 'bg-green-100' },
    { name: 'Create Thread', href: '/dashboard/thread-generator', icon: FileText, color: 'bg-purple-100' },
    { name: 'Viral Posts', href: '/dashboard/post-generator', icon: Sparkles, color: 'bg-yellow-100' },
    { name: 'Rewrite Thread', href: '/dashboard/thread-rewriter', icon: Edit, color: 'bg-orange-100' },
  ];

  const recentActivity = [
    { type: 'DM', content: 'Cold outreach to @techfounder...', time: '2 hours ago' },
    { type: 'Thread', content: 'AI in Marketing: The Future is...', time: '5 hours ago' },
    { type: 'Reply', content: 'Great point about startups...', time: '1 day ago' },
    { type: 'DM', content: 'Partnership proposal for...', time: '2 days ago' },
  ];

  const userName = user?.name || user?.email?.split('@')[0] || 'there';

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {userName}! 👋</h1>
        <p className="text-gray-600">Ready to create some amazing X content?</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">87</div>
            <p className="text-xs text-green-600">+12% from last week</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Saved Items</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">23</div>
            <p className="text-xs text-gray-600">DMs, replies & threads</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Streak</CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">5 days</div>
            <p className="text-xs text-yellow-600">Keep it up! 🔥</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {shortcuts.map((shortcut) => {
              const Icon = shortcut.icon;
              return (
                <Link key={shortcut.name} to={shortcut.href}>
                  <div className="flex flex-col items-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
                    <div className={`w-12 h-12 rounded-lg ${shortcut.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-gray-900" />
                    </div>
                    <span className="text-sm text-gray-700 text-center">{shortcut.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily tip */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center">
              💡 Daily Tip
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Start your DMs with a genuine compliment about their recent work. It increases response rates by 40%!
            </p>
            <Button variant="secondary" size="sm">
              More Tips <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{activity.content}</p>
                    <p className="text-xs text-gray-500">{activity.type} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/dashboard/saved-content">
              <Button variant="ghost" size="sm" className="w-full mt-4 text-blue-600 hover:text-blue-700">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
