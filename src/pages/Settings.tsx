import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Settings as SettingsIcon, 
  User, 
  Palette, 
  Bell, 
  Shield,
  Trash2,
  Plus,
  X,
  Save
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
  const { user } = useAuth();
  const { toast } = useToast();

  const tones = [
    { id: 'professional', name: 'Professional' },
    { id: 'friendly', name: 'Friendly' },
    { id: 'casual', name: 'Casual' },
    { id: 'witty', name: 'Witty' },
    { id: 'authoritative', name: 'Authoritative' },
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

  const addWritingStyleHandle = () => {
    if (!newHandle.trim()) return;
    
    const handle = newHandle.startsWith('@') ? newHandle : `@${newHandle}`;
    if (!settings.writing_style_handles?.includes(handle)) {
      setSettings({
        ...settings,
        writing_style_handles: [...(settings.writing_style_handles || []), handle]
      });
    }
    setNewHandle('');
  };

  const removeWritingStyleHandle = (handle: string) => {
    setSettings({
      ...settings,
      writing_style_handles: settings.writing_style_handles?.filter(h => h !== handle) || []
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Loading your settings...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Manage your preferences and account settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <User className="w-5 h-5 mr-2" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="bg-gray-700 border-gray-600 text-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="name" className="text-gray-300">Display Name</Label>
              <Input
                id="name"
                value={user?.name || ''}
                placeholder="Your display name"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="x-handle" className="text-gray-300">X Handle (optional)</Label>
              <Input
                id="x-handle"
                value={user?.x_handle || ''}
                placeholder="@yourusername"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Content Preferences */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <SettingsIcon className="w-5 h-5 mr-2" />
              Content Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="default-tone" className="text-gray-300">Default Tone</Label>
              <select
                id="default-tone"
                value={settings.default_tone}
                onChange={(e) => setSettings({ ...settings, default_tone: e.target.value })}
                className="w-full mt-1 bg-gray-700 border-gray-600 text-white rounded-md px-3 py-2"
              >
                {tones.map(tone => (
                  <option key={tone.id} value={tone.id}>{tone.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="tweet-limit" className="text-gray-300">Tweet Length Limit</Label>
              <Input
                id="tweet-limit"
                type="number"
                min="100"
                max="280"
                value={settings.tweet_length_limit}
                onChange={(e) => setSettings({ ...settings, tweet_length_limit: parseInt(e.target.value) })}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-save" className="text-gray-300">Auto-save content</Label>
                <p className="text-sm text-gray-400">Automatically save generated content to your library</p>
              </div>
              <Switch
                id="auto-save"
                checked={settings.auto_save}
                onCheckedChange={(checked) => setSettings({ ...settings, auto_save: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Writing Style Inspiration */}
        <Card className="bg-gray-800 border-gray-700 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Palette className="w-5 h-5 mr-2" />
              Writing Style Inspiration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-400 text-sm">
              Add X handles to train AI on their writing style. The AI will analyze their tweets to match their tone and style.
            </p>
            
            <div className="flex space-x-2">
              <Input
                placeholder="@username"
                value={newHandle}
                onChange={(e) => setNewHandle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addWritingStyleHandle()}
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
              <Button onClick={addWritingStyleHandle} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>

            {settings.writing_style_handles && settings.writing_style_handles.length > 0 && (
              <div className="space-y-2">
                <Label className="text-gray-300">Added Handles:</Label>
                <div className="flex flex-wrap gap-2">
                  {settings.writing_style_handles.map((handle, index) => (
                    <div key={index} className="flex items-center bg-gray-700 rounded-lg px-3 py-1">
                      <span className="text-white text-sm">{handle}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeWritingStyleHandle(handle)}
                        className="ml-2 h-auto p-0 text-gray-400 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Email notifications</Label>
                <p className="text-sm text-gray-400">Receive updates about new features</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Usage alerts</Label>
                <p className="text-sm text-gray-400">Get notified when approaching limits</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Account & Security */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Account & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-gray-300">Plan</Label>
              <div className="flex items-center justify-between mt-1">
                <span className="text-white capitalize">{user?.plan_tier || 'Starter'} Plan</span>
                <Button variant="outline" size="sm">
                  Upgrade
                </Button>
              </div>
            </div>
            <div>
              <Button variant="outline" className="w-full">
                Change Password
              </Button>
            </div>
            <div>
              <Button variant="outline" className="w-full text-red-400 hover:text-red-300 border-red-600 hover:border-red-500">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSaving ? (
            <>
              <Save className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Settings;
