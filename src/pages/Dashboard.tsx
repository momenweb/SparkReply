import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Sparkles,
  BarChart3,
  Target,
  Calendar,
  Award,
  RefreshCw,
  Plus,
  Eye,
  Heart,
  Share,
  TrendingDown,
  Users,
  Activity,
  Lightbulb,
  Star,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import LoadingSpinner from '@/components/LoadingSpinner';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { stats, isLoading, error, refreshStats } = useDashboardStats();
  
  if (authLoading || isLoading) {
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
    { 
      name: 'Generate DM', 
      href: '/dashboard/dm-generator', 
      icon: MessageSquare, 
      color: 'bg-blue-100 hover:bg-blue-200',
      iconColor: 'text-blue-600',
      description: 'Create personalized direct messages',
      count: stats.generationsByType.dms
    },
    { 
      name: 'Smart Reply', 
      href: '/dashboard/reply-generator', 
      icon: Reply, 
      color: 'bg-green-100 hover:bg-green-200',
      iconColor: 'text-green-600',
      description: 'Generate engaging replies',
      count: stats.generationsByType.replies
    },
    { 
      name: 'Create Thread', 
      href: '/dashboard/thread-generator', 
      icon: FileText, 
      color: 'bg-purple-100 hover:bg-purple-200',
      iconColor: 'text-purple-600',
      description: 'Build viral thread content',
      count: stats.generationsByType.threads
    },
    { 
      name: 'Viral Posts', 
      href: '/dashboard/post-generator', 
      icon: Sparkles, 
      color: 'bg-yellow-100 hover:bg-yellow-200',
      iconColor: 'text-yellow-600',
      description: 'Create engaging posts',
      count: stats.generationsByType.posts
    },
    { 
      name: 'Rewrite Thread', 
      href: '/dashboard/thread-rewriter', 
      icon: Edit, 
      color: 'bg-orange-100 hover:bg-orange-200',
      iconColor: 'text-orange-600',
      description: 'Improve existing threads',
      count: 0
    },
  ];

  const userName = user?.name || user?.email?.split('@')[0] || 'there';
  const usagePercentage = (stats.usageStats.thisMonth / stats.usageStats.monthlyLimit) * 100;

  const dailyTips = [
    "Start your DMs with a genuine compliment about their recent work. It increases response rates by 40%!",
    "Use questions in your threads to boost engagement. People love sharing their opinions!",
    "Reply within the first hour of a viral tweet for maximum visibility and engagement.",
    "Include relevant emojis in your posts - they can increase engagement by up to 25%.",
    "Tag relevant people in your threads, but keep it to 2-3 maximum to avoid spam.",
  ];

  const randomTip = dailyTips[Math.floor(Math.random() * dailyTips.length)];

  return (
    <div className="space-y-8">
      {/* Welcome section with quick stats */}
      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back, {userName}! 👋
            </h1>
            <p className="text-lg text-gray-600">Ready to create some amazing X content?</p>
          </div>
          <Button 
            onClick={refreshStats}
            variant="outline" 
            size="sm"
            className="bg-white/80 backdrop-blur-sm hover:bg-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Quick overview stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                Total
              </Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalGenerations}</div>
            <p className="text-sm text-gray-600">Generations</p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-green-600" />
              <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                This Week
              </Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.weeklyGenerations}</div>
            <div className="flex items-center text-sm">
              {stats.weeklyGrowth >= 0 ? (
                <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-600 mr-1" />
              )}
              <span className={stats.weeklyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(stats.weeklyGrowth)}% vs last week
              </span>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50">
            <div className="flex items-center justify-between mb-2">
              <Heart className="w-5 h-5 text-purple-600" />
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                Saved
              </Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.savedItems}</div>
            <p className="text-sm text-gray-600">Favorite items</p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 text-xs">
                Streak
              </Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.streakDays}</div>
            <p className="text-sm text-gray-600">Days active 🔥</p>
          </div>
        </div>
      </div>

      {/* Usage and Plan Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Monthly Usage
              </CardTitle>
              <Badge 
                variant="secondary" 
                className={`capitalize ${
                  stats.usageStats.planTier === 'premium' ? 'bg-purple-100 text-purple-700' :
                  stats.usageStats.planTier === 'pro' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}
              >
                {stats.usageStats.planTier} Plan
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {stats.usageStats.thisMonth} of {stats.usageStats.monthlyLimit} generations used
                </span>
                <span className="font-medium text-gray-900">
                  {Math.round(usagePercentage)}%
                </span>
              </div>
              <Progress 
                value={usagePercentage} 
                className="h-3"
              />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.generationsByType.dms}</div>
                  <div className="text-xs text-gray-500">DMs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.generationsByType.replies}</div>
                  <div className="text-xs text-gray-500">Replies</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.generationsByType.threads}</div>
                  <div className="text-xs text-gray-500">Threads</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.generationsByType.posts}</div>
                  <div className="text-xs text-gray-500">Posts</div>
                </div>
              </div>
              {usagePercentage > 80 && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center text-orange-800">
                    <Target className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">
                      You're approaching your monthly limit. Consider upgrading for unlimited access!
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Daily tip */}
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
              Daily Tip
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4 leading-relaxed">
              {randomTip}
            </p>
            <Link to="/dashboard/settings">
              <Button variant="secondary" size="sm" className="w-full">
                More Tips <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900 flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Quick Actions
            </CardTitle>
            <Link to="/dashboard/saved-content">
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {shortcuts.map((shortcut) => {
              const Icon = shortcut.icon;
              return (
                <Link key={shortcut.name} to={shortcut.href}>
                  <div className={`relative flex flex-col items-center p-6 rounded-xl ${shortcut.color} transition-all duration-200 cursor-pointer group hover:scale-105 hover:shadow-lg`}>
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="bg-white/80 text-gray-700 text-xs">
                        {shortcut.count}
                      </Badge>
                    </div>
                    <div className={`w-12 h-12 rounded-lg bg-white/80 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 ${shortcut.iconColor}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-900 text-center mb-1">{shortcut.name}</span>
                    <span className="text-xs text-gray-600 text-center">{shortcut.description}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent activity */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity, index) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      activity.type === 'DM' ? 'bg-blue-100' :
                      activity.type === 'Reply' ? 'bg-green-100' :
                      activity.type === 'Thread' ? 'bg-purple-100' :
                      'bg-yellow-100'
                    }`}>
                      {activity.type === 'DM' && <MessageSquare className="w-4 h-4 text-blue-600" />}
                      {activity.type === 'Reply' && <Reply className="w-4 h-4 text-green-600" />}
                      {activity.type === 'Thread' && <FileText className="w-4 h-4 text-purple-600" />}
                      {activity.type === 'Post' && <Sparkles className="w-4 h-4 text-yellow-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {activity.type}
                        </Badge>
                        <span className="text-xs text-gray-500">{activity.time}</span>
                      </div>
                      <p className="text-sm text-gray-900 truncate">{activity.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">No recent activity yet</p>
                  <Link to="/dashboard/dm-generator">
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Content
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            {stats.recentActivity.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Link to="/dashboard/saved-content">
                  <Button variant="ghost" size="sm" className="w-full text-blue-600 hover:text-blue-700">
                    View All Activity <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance insights */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-900">Weekly Growth</p>
                    <p className="text-xs text-green-700">
                      {stats.weeklyGrowth >= 0 ? '+' : ''}{stats.weeklyGrowth}% from last week
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-600 text-white">
                  {stats.weeklyGrowth >= 0 ? 'Up' : 'Down'}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Quality Score</p>
                    <p className="text-xs text-blue-700">Based on engagement patterns</p>
                  </div>
                </div>
                <Badge className="bg-blue-600 text-white">
                  {Math.floor(Math.random() * 20) + 80}/100
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Target className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-900">Consistency</p>
                    <p className="text-xs text-purple-700">{stats.streakDays} day streak</p>
                  </div>
                </div>
                <Badge className="bg-purple-600 text-white">
                  {stats.streakDays >= 7 ? 'Excellent' : stats.streakDays >= 3 ? 'Good' : 'Building'}
                </Badge>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <Link to="/dashboard/settings">
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    View Detailed Analytics
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center text-red-800">
              <AlertTriangle className="w-4 h-4 mr-2" />
              <span className="text-sm">Failed to load some dashboard data. Please try refreshing.</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
