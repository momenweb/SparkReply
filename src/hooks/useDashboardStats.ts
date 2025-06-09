import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  totalGenerations: number;
  weeklyGenerations: number;
  weeklyGrowth: number;
  savedItems: number;
  streakDays: number;
  generationsByType: {
    dms: number;
    replies: number;
    threads: number;
    posts: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'DM' | 'Reply' | 'Thread' | 'Post';
    content: string;
    time: string;
    target?: string;
  }>;
  usageStats: {
    thisMonth: number;
    monthlyLimit: number;
    planTier: string;
  };
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalGenerations: 0,
    weeklyGenerations: 0,
    weeklyGrowth: 0,
    savedItems: 0,
    streakDays: 0,
    generationsByType: {
      dms: 0,
      replies: 0,
      threads: 0,
      posts: 0,
    },
    recentActivity: [],
    usageStats: {
      thisMonth: 0,
      monthlyLimit: 100,
      planTier: 'starter',
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const calculateWeeklyGrowth = (currentWeek: number, previousWeek: number): number => {
    if (previousWeek === 0) return currentWeek > 0 ? 100 : 0;
    return Math.round(((currentWeek - previousWeek) / previousWeek) * 100);
  };

  const calculateStreak = (activities: any[]): number => {
    if (activities.length === 0) return 0;
    
    const today = new Date();
    const sortedActivities = activities
      .map(activity => new Date(activity.created_at))
      .sort((a, b) => b.getTime() - a.getTime());
    
    let streak = 0;
    let currentDate = new Date(today);
    currentDate.setHours(0, 0, 0, 0);
    
    for (const activityDate of sortedActivities) {
      const activityDay = new Date(activityDate);
      activityDay.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((currentDate.getTime() - activityDay.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (diffDays > streak) {
        break;
      }
    }
    
    return streak;
  };

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  };

  const loadDashboardStats = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      // Simulate loading real data - in a real app, you'd fetch from your API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate realistic stats based on user activity
      const now = new Date();
      const userCreatedAt = new Date(user.created_at || now);
      const daysSinceJoined = Math.floor((now.getTime() - userCreatedAt.getTime()) / (1000 * 60 * 60 * 24));
      
      // Simulate realistic usage patterns
      const baseGenerations = Math.min(daysSinceJoined * 2, 150);
      const weeklyBase = Math.floor(baseGenerations * 0.3);
      const lastWeekBase = Math.floor(weeklyBase * 0.8);
      
      const generationsByType = {
        dms: Math.floor(baseGenerations * 0.4),
        replies: Math.floor(baseGenerations * 0.3),
        threads: Math.floor(baseGenerations * 0.2),
        posts: Math.floor(baseGenerations * 0.1),
      };

      // Generate recent activity
      const activityTypes = ['DM', 'Reply', 'Thread', 'Post'] as const;
      const recentActivity = Array.from({ length: 5 }, (_, i) => {
        const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
        const hoursAgo = i * 3 + Math.floor(Math.random() * 6);
        const activityTime = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
        
        const contentMap = {
          DM: ['Cold outreach to @techfounder', 'Partnership proposal for @startup', 'Follow-up with @investor', 'Networking with @creator'],
          Reply: ['Great insights on AI trends', 'Love this perspective on growth', 'Totally agree with this take', 'Thanks for sharing this'],
          Thread: ['AI in Marketing: The Future', '5 lessons from building SaaS', 'Growth hacking strategies', 'Personal branding tips'],
          Post: ['Viral content about startups', 'Motivational Monday post', 'Industry insights shared', 'Behind-the-scenes content'],
        };
        
        return {
          id: `activity-${i}`,
          type,
          content: contentMap[type][Math.floor(Math.random() * contentMap[type].length)] + '...',
          time: formatTimeAgo(activityTime.toISOString()),
          target: type === 'DM' ? `user${i + 1}` : undefined,
        };
      });

      // Calculate streak (simulate based on recent activity)
      const streakDays = Math.min(Math.floor(Math.random() * 10) + 1, daysSinceJoined);
      
      // Calculate saved items
      const savedItems = Math.floor(baseGenerations * 0.25);
      
      // Calculate monthly usage
      const thisMonth = Math.floor(baseGenerations * 0.6);
      const planTier = user.plan_tier || 'starter';
      const planLimits = {
        starter: 100,
        pro: 500,
        premium: 2000,
      };
      const monthlyLimit = planLimits[planTier as keyof typeof planLimits] || 100;

      setStats({
        totalGenerations: baseGenerations,
        weeklyGenerations: weeklyBase,
        weeklyGrowth: calculateWeeklyGrowth(weeklyBase, lastWeekBase),
        savedItems,
        streakDays,
        generationsByType,
        recentActivity,
        usageStats: {
          thisMonth,
          monthlyLimit,
          planTier,
        },
      });

    } catch (err) {
      console.error('Error loading dashboard stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard statistics');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadDashboardStats();
    }
  }, [user, loadDashboardStats]);

  const refreshStats = useCallback(() => {
    loadDashboardStats();
  }, [loadDashboardStats]);

  return {
    stats,
    isLoading,
    error,
    refreshStats,
  };
} 