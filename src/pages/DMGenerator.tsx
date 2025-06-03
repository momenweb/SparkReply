import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Copy, 
  Save, 
  RefreshCw, 
  Target, 
  Zap, 
  Twitter,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Users
} from 'lucide-react';
import { useDMGenerator } from '@/hooks/useDMGenerator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { saveContent } from '@/lib/api';

const DMGenerator = () => {
  const [goal, setGoal] = useState('');
  const [targetHandle, setTargetHandle] = useState('');
  const [selectedTone, setSelectedTone] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const {
    generateDMs,
    isGenerating,
    result,
    error,
    clearError,
    clearResult,
    validateHandle,
    formatHandle
  } = useDMGenerator();

  const toneStyles = {
    professional: {
      name: 'Professional',
      icon: '🏢',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      description: 'Formal and business-focused'
    },
    casual: {
      name: 'Casual',
      icon: '😊',
      color: 'bg-green-100 text-green-800 border-green-200',
      description: 'Friendly and approachable'
    },
    bold: {
      name: 'Bold',
      icon: '💪',
      color: 'bg-red-100 text-red-800 border-red-200',
      description: 'Confident and direct'
    },
    witty: {
      name: 'Witty',
      icon: '😄',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      description: 'Clever and engaging'
    }
  };

  const handleGenerate = async () => {
    if (!goal.trim() || !targetHandle.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in both the goal and target handle.",
        variant: "destructive",
      });
      return;
    }

    const cleanHandle = formatHandle(targetHandle);
    if (!validateHandle(cleanHandle)) {
      toast({
        title: "Invalid handle",
        description: "Please enter a valid Twitter/X username.",
        variant: "destructive",
      });
      return;
    }

    try {
      await generateDMs(cleanHandle, goal.trim());
      toast({
        title: "DMs generated!",
        description: "Your personalized DMs are ready in 4 different tones.",
      });
    } catch (error: any) {
      console.error('Error generating DMs:', error);
      // Error is already handled by the hook
    }
  };

  const handleCopy = async (content: string, tone: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied!",
        description: `${toneStyles[tone as keyof typeof toneStyles].name} DM copied to clipboard.`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async (content: string, tone: string) => {
    if (!user) return;

    try {
      await saveContent({
        user_id: user.id,
        type: 'dm',
        title: `${toneStyles[tone as keyof typeof toneStyles].name} DM to @${result?.data.target_user.username}`,
        content: content,
        metadata: { 
          target_handle: result?.data.target_user.username, 
          goal, 
          tone,
          target_name: result?.data.target_user.name,
          target_followers: result?.data.target_user.followers
        }
      });
      toast({
        title: "Saved!",
        description: `${toneStyles[tone as keyof typeof toneStyles].name} DM saved to your library.`,
      });
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error.message || "Failed to save DM.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">DM Generator</h1>
        <p className="text-gray-600">Create personalized direct messages that get responses using AI analysis</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button variant="outline" size="sm" onClick={clearError}>
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input section */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Message Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target X Handle
                </label>
                <Input
                  placeholder="elonmusk (without @)"
                  value={targetHandle}
                  onChange={(e) => setTargetHandle(e.target.value)}
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter username without @ symbol
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goal or Outcome
                </label>
                <Textarea
                  placeholder="e.g., Get them to try our new AI DM outreach tool, Book a discovery call, Start a conversation about partnerships..."
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Be specific about what you want to achieve
                </p>
              </div>

              <Button 
                onClick={handleGenerate} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isGenerating || !goal.trim() || !targetHandle.trim()}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing profile & generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Personalized DMs
                  </>
                )}
              </Button>

              {result && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center text-green-800 mb-2">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span className="font-medium">Analysis Complete</span>
                  </div>
                  <div className="text-sm text-green-700 space-y-1">
                    <p><strong>Target:</strong> {result.data.target_user.name} (@{result.data.target_user.username})</p>
                    <p><strong>Followers:</strong> {result.data.target_user.followers?.toLocaleString()}</p>
                    {result.data.target_user.bio && (
                      <p><strong>Bio:</strong> {result.data.target_user.bio.substring(0, 100)}...</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Output section */}
        <div className="lg:col-span-2">
          {result ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Generated DMs</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerate()}
                  disabled={isGenerating}
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Regenerate All
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(result.data.dms).map(([tone, content]) => {
                  const style = toneStyles[tone as keyof typeof toneStyles];
                  return (
                    <Card key={tone} className="bg-white border-gray-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="mr-2">{style.icon}</span>
                            {style.name}
                          </div>
                          <Badge variant="outline" className={style.color}>
                            {content.length}/280
                          </Badge>
                        </CardTitle>
                        <p className="text-xs text-gray-600">{style.description}</p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <p className="text-sm text-gray-900 whitespace-pre-wrap">
                            {content}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleCopy(content, tone)}
                            className="flex-1"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleSave(content, tone)}
                            className="flex-1"
                          >
                            <Save className="w-3 h-3 mr-1" />
                            Save
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 rounded-full p-2">
                      <Twitter className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-blue-900 mb-1">Pro Tips for DM Success</h3>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Send DMs when your target is most active (check their posting times)</li>
                        <li>• Follow up if no response after 1-2 weeks, but add new value</li>
                        <li>• Personalize further by mentioning specific recent tweets or achievements</li>
                        <li>• Keep your profile professional - they'll likely check it before responding</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="bg-white border-gray-200">
              <CardContent className="text-center py-12">
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                    <MessageSquare className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Ready to Generate Personalized DMs?
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Enter a target handle and your goal to get 4 different personalized DMs. 
                      Our AI will analyze their profile and recent tweets for maximum personalization.
                    </p>
                  </div>
                  <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      Profile Analysis
                    </div>
                    <div className="flex items-center">
                      <Twitter className="w-4 h-4 mr-1" />
                      Tweet Context
                    </div>
                    <div className="flex items-center">
                      <Zap className="w-4 h-4 mr-1" />
                      AI Personalization
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DMGenerator;
