import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Settings as SettingsIcon, 
  User, 
  Palette, 
  Bell, 
  Shield,
  Trash2,
  Plus,
  X,
  Save,
  Twitter,
  Mail,
  Key,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { getUserSettings, updateUserSettings } from '@/lib/api';
import { UserSettings } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const [settings, setSettings] = useState<Partial<UserSettings>>({
    default_tone: 'professional',
    writing_style_handles: [],
    auto_save: true,
    tweet_length_limit: 280
  });
  const [newHandle, setNewHandle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const tones = [
    { id: 'professional', name: 'Professional', description: 'Formal and business-focused tone' },
    { id: 'friendly', name: 'Friendly', description: 'Warm and approachable communication style' },
    { id: 'casual', name: 'Casual', description: 'Relaxed and conversational tone' },
    { id: 'witty', name: 'Witty', description: 'Clever and humorous writing style' },
    { id: 'authoritative', name: 'Authoritative', description: 'Expert and confident tone' },
  ];

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const userSettings = await getUserSettings(user.id);
      if (userSettings) {
        setSettings(userSettings);
      }
    } catch (error: any) {
      console.error('Error loading settings:', error);
      toast({
        title: "Load failed",
        description: error.message || "Failed to load settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      await updateUserSettings(user.id, settings);
      setHasChanges(false);
      toast({
        title: "Settings saved!",
        description: "Your preferences have been updated.",
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: "Save failed",
        description: error.message || "Failed to save settings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const addWritingStyleHandle = () => {
    if (!newHandle.trim()) return;
    
    const handle = newHandle.startsWith('@') ? newHandle : `@${newHandle}`;
    if (!settings.writing_style_handles?.includes(handle)) {
      updateSettings({
        writing_style_handles: [...(settings.writing_style_handles || []), handle]
      });
    }
    setNewHandle('');
  };

  const removeWritingStyleHandle = (handle: string) => {
    updateSettings({
      writing_style_handles: settings.writing_style_handles?.filter(h => h !== handle) || []
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-500">Loading your settings...</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-white">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
      <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-500">Manage your preferences and account settings</p>
        </div>
        {hasChanges && (
          <Button 
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal information and public profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-gray-700">Email Address</Label>
              <div className="mt-1 flex items-center space-x-2">
              <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-gray-50 border-gray-200 text-gray-500"
                />
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                  Verified
                </Badge>
              </div>
            </div>
            <div>
              <Label htmlFor="name" className="text-gray-700">Display Name</Label>
              <Input
                id="name"
                value={user?.name || ''}
                placeholder="Your display name"
                onChange={(e) => updateSettings({ display_name: e.target.value })}
                className="mt-1 bg-white border-gray-200 text-gray-900 placeholder-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="x-handle" className="text-gray-700">X (Twitter) Handle</Label>
              <div className="mt-1 relative">
                <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                  id="x-handle"
                  value={user?.x_handle || ''}
                  placeholder="@yourusername"
                  onChange={(e) => updateSettings({ x_handle: e.target.value })}
                  className="pl-10 bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Connect your X account to enable style analysis and personalization
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Content Preferences */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center">
              <SettingsIcon className="w-5 h-5 mr-2" />
              Content Preferences
            </CardTitle>
            <CardDescription>
              Customize your content generation settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="default-tone" className="text-gray-700">Default Tone</Label>
              <select
                id="default-tone"
                value={settings.default_tone}
                onChange={(e) => updateSettings({ default_tone: e.target.value })}
                className="w-full mt-1 bg-white border border-gray-200 text-gray-900 rounded-md px-3 py-2"
              >
                {tones.map(tone => (
                  <option key={tone.id} value={tone.id}>{tone.name}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {tones.find(t => t.id === settings.default_tone)?.description}
              </p>
            </div>
            <div>
              <Label htmlFor="tweet-limit" className="text-gray-700">Tweet Length Limit</Label>
              <div className="mt-1 flex items-center space-x-2">
                <Input
                  id="tweet-limit"
                  type="number"
                  min="100"
                  max="280"
                  value={settings.tweet_length_limit}
                  onChange={(e) => updateSettings({ tweet_length_limit: parseInt(e.target.value) })}
                  className="bg-white border-gray-200 text-gray-900"
                />
                <span className="text-sm text-gray-500">characters</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Set your preferred maximum tweet length (100-280 characters)
              </p>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div>
                <Label htmlFor="auto-save" className="text-gray-700">Auto-save Content</Label>
                <p className="text-sm text-gray-500">Automatically save generated content to your library</p>
              </div>
              <Switch
                id="auto-save"
                checked={settings.auto_save}
                onCheckedChange={(checked) => updateSettings({ auto_save: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Writing Style Inspiration */}
        <Card className="bg-white lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center">
              <Palette className="w-5 h-5 mr-2" />
              Writing Style Inspiration
            </CardTitle>
            <CardDescription>
              Add X handles to train AI on their writing style for better content generation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="@username"
                  value={newHandle}
                  onChange={(e) => setNewHandle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addWritingStyleHandle()}
                  className="pl-10 bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                />
              </div>
              <Button 
                onClick={addWritingStyleHandle} 
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Handle
              </Button>
            </div>

            {settings.writing_style_handles && settings.writing_style_handles.length > 0 && (
            <div className="space-y-2">
                <Label className="text-gray-700">Added Handles:</Label>
                <ScrollArea className="h-32 rounded-md border border-gray-200 p-2">
                  <div className="flex flex-wrap gap-2">
                    {settings.writing_style_handles.map((handle, index) => (
                      <div 
                        key={index} 
                        className="flex items-center bg-blue-50 text-blue-700 rounded-lg px-3 py-1.5 border border-blue-200"
                      >
                        <Twitter className="w-3 h-3 mr-1.5" />
                        <span className="text-sm">{handle}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeWritingStyleHandle(handle)}
                          className="ml-2 h-auto p-0 text-blue-600 hover:text-red-600 hover:bg-transparent"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <p className="text-xs text-gray-500">
                  The AI will analyze these accounts' tweets to match their writing style
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notifications
            </CardTitle>
            <CardDescription>
              Manage your email preferences and alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-700">Email Updates</Label>
                <p className="text-sm text-gray-500">Receive updates about new features and improvements</p>
              </div>
              <Switch />
            </div>
            <Separator className="bg-gray-100" />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-700">Usage Alerts</Label>
                <p className="text-sm text-gray-500">Get notified when approaching your plan limits</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Account & Security */}
        <Card className="bg-white">
        <CardHeader>
            <CardTitle className="text-gray-900 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Account & Security
          </CardTitle>
            <CardDescription>
              Manage your subscription and account security
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
              <Label className="text-gray-700">Current Plan</Label>
              <div className="mt-2 flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-blue-600" />
              <div>
                    <p className="font-medium text-gray-900">{user?.plan_tier || 'Starter'} Plan</p>
                    <p className="text-sm text-gray-500">100 generations per month</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                  Upgrade
                    </Button>
              </div>
            </div>

            <Separator className="bg-gray-100" />
            
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <Key className="w-4 h-4 mr-2" />
                Change Password
              </Button>
              
                <Button
                variant="outline" 
                className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Delete Account
                </Button>
              </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button - Fixed at bottom */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg lg:left-64">
          <div className="container max-w-7xl mx-auto flex items-center justify-between">
            <p className="text-sm text-gray-600">
              You have unsaved changes
            </p>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => loadSettings()}
                className="border-gray-200"
              >
                Discard Changes
              </Button>
              <Button 
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
