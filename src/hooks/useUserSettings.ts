import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserSettings } from '@/lib/api';
import { UserSettings } from '@/lib/supabase';

export function useUserSettings() {
  const [settings, setSettings] = useState<Partial<UserSettings>>({
    default_tone: 'professional',
    writing_style_handles: [],
    auto_save: true,
    tweet_length_limit: 280
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const loadSettings = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const userSettings = await getUserSettings(user.id);
      if (userSettings) {
        setSettings(userSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user, loadSettings]);

  return {
    settings,
    isLoading,
    writingStyleHandles: settings.writing_style_handles || [],
    defaultTone: settings.default_tone,
    autoSave: settings.auto_save,
    tweetLengthLimit: settings.tweet_length_limit,
    refresh: loadSettings
  };
} 