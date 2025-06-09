import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Copy, 
  Save, 
  RefreshCw, 
  Zap, 
  Twitter,
  AlertCircle,
  CheckCircle,
  Edit3,
  ArrowRight,
  Link,
  User,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { useThreadRewriter } from '@/hooks/useThreadRewriter';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { saveContent } from '@/lib/api';

const ThreadRewriter = () => {
  const [threadContent, setThreadContent] = useState('');
  const [threadUrl, setThreadUrl] = useState('');
  const [tone, setTone] = useState('');
  const [rewriteType, setRewriteType] = useState('');
  const [handleToMimic, setHandleToMimic] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  
  const {
    rewriteThread,
    isRewriting,
    result,
    error,
    clearError,
    clearResult,
  } = useThreadRewriter();

  const toneOptions = [
    { value: 'viral', label: 'Viral' },
    { value: 'smart', label: 'Smart' },
    { value: 'emotional', label: 'Emotional' },
    { value: 'punchy', label: 'Punchy' },
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'humorous', label: 'Humorous' },
    { value: 'inspirational', label: 'Inspirational' }
  ];

  const rewriteTypeOptions = [
    { value: 'viral', label: 'Make it go viral' },
    { value: 'simplify', label: 'Simplify it' },
    { value: 'storytelling', label: 'Add storytelling' },
    { value: 'punchy', label: 'Make it more punchy' },
    { value: 'style-mimic', label: 'Rewrite in selected handle\'s style' }
  ];

  const handleRewrite = async () => {
    if (!threadContent.trim() && !threadUrl.trim()) {
      toast({
        title: "Missing content",
        description: "Please enter thread content or provide a thread URL.",
        variant: "destructive",
      });
      return;
    }

    if (!rewriteType) {
      toast({
        title: "Missing rewrite type",
        description: "Please select how you want to rewrite the thread.",
        variant: "destructive",
      });
      return;
    }

    try {
      await rewriteThread(
        threadContent.trim(),
        rewriteType,
        threadUrl.trim() || undefined,
        tone || undefined,
        handleToMimic.trim() || undefined
      );
      toast({
        title: "Thread rewritten!",
        description: "Your thread has been successfully rewritten.",
      });
    } catch (error: any) {
      console.error('Error rewriting thread:', error);
      // Error is already handled by the hook
    }
  };

  const handleCopyAll = async (tweets: string[], type: 'original' | 'rewritten') => {
    if (!tweets || tweets.length === 0) return;

    try {
      const threadText = tweets
        .map((tweet, index) => `${index + 1}/${tweets.length} ${tweet}`)
        .join('\n\n');
      
      await navigator.clipboard.writeText(threadText);
      toast({
        title: "Copied!",
        description: `${type === 'original' ? 'Original' : 'Rewritten'} thread copied to clipboard.`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleCopyTweet = async (tweet: string, index: number, type: 'original' | 'rewritten') => {
    try {
      await navigator.clipboard.writeText(tweet);
      toast({
        title: "Copied!",
        description: `${type === 'original' ? 'Original' : 'Rewritten'} tweet ${index + 1} copied.`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleReplaceOriginal = () => {
    if (!result?.data.rewritten) return;
    
    const rewrittenText = result.data.rewritten.join('\n\n');
    setThreadContent(rewrittenText);
    setThreadUrl(''); // Clear URL since we're replacing with new content
    
    toast({
      title: "Replaced!",
      description: "Original thread replaced with rewritten version.",
    });
  };

  const handleSave = async () => {
    if (!user || !result?.data.rewritten) return;

    try {
      await saveContent({
        user_id: user.id,
        type: 'thread',
        title: `Rewritten Thread: ${result.data.rewriteType}`,
        content: result.data.rewritten.join('\n\n'),
        metadata: { 
          rewriteType: result.data.rewriteType,
          tone: result.data.tone,
          handleToMimic: result.data.handleToMimic,
          mimicUserInfo: result.data.mimicUserInfo,
          originalThread: result.data.original,
          threadUrl: result.data.threadUrl
        }
      });
      toast({
        title: "Saved!",
        description: "Rewritten thread saved to your library.",
      });
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error.message || "Failed to save thread.",
        variant: "destructive",
      });
    }
  };

  const detectThreadUrl = (text: string) => {
    const urlMatch = text.match(/https:\/\/(twitter\.com|x\.com)\/\w+\/status\/\d+/);
    if (urlMatch) {
      setThreadUrl(urlMatch[0]);
      setThreadContent(''); // Clear content since we have URL
      toast({
        title: "Thread URL detected!",
        description: "We'll fetch the thread content automatically.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Thread Rewriter</h1>
        <p className="text-gray-600">Transform existing X (Twitter) threads with AI-powered rewriting</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white border-gray-200">
          <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Edit3 className="w-5 h-5 mr-2" />
                Thread Input
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thread URL (Optional)
                </label>
                <Input
                  placeholder="https://x.com/username/status/123456789..."
                  value={threadUrl}
                  onChange={(e) => setThreadUrl(e.target.value)}
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste a thread URL to automatically fetch content
                </p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">OR</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thread Content *
              </label>
              <Textarea
                  placeholder="Paste your existing thread here... (each tweet separated by line breaks)"
                  value={threadContent}
                  onChange={(e) => {
                    setThreadContent(e.target.value);
                    detectThreadUrl(e.target.value);
                  }}
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 min-h-[120px]"
                rows={6}
              />
                <p className="text-xs text-gray-500 mt-1">
                  Paste the thread content or individual tweets
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rewrite Type *
                </label>
                <Select value={rewriteType} onValueChange={setRewriteType}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="Choose how to rewrite the thread" />
                  </SelectTrigger>
                  <SelectContent>
                    {rewriteTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Select the type of rewrite you want
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tone/Style (Optional)
              </label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="Select a tone (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {toneOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Choose the tone for the rewritten thread
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Handle to Mimic (Optional)
                </label>
                <Input
                  placeholder="@username or username"
                  value={handleToMimic}
                  onChange={(e) => setHandleToMimic(e.target.value)}
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Mimic the writing style of a specific user
                </p>
            </div>

            <Button 
              onClick={handleRewrite} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isRewriting || (!threadContent.trim() && !threadUrl.trim()) || !rewriteType}
            >
              {isRewriting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Rewriting thread...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Rewrite Thread
                </>
              )}
            </Button>

              {result && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center text-green-800 mb-2">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span className="font-medium">Thread Rewritten</span>
                  </div>
                  <div className="text-sm text-green-700 space-y-1">
                    <p><strong>Type:</strong> {result.data.rewriteType}</p>
                    <p><strong>Original:</strong> {result.data.original.length} tweets</p>
                    <p><strong>Rewritten:</strong> {result.data.rewritten.length} tweets</p>
                    {result.data.tone && <p><strong>Tone:</strong> {result.data.tone}</p>}
                    {result.data.mimicUserInfo && (
                      <p><strong>Style:</strong> Mimicking @{result.data.mimicUserInfo.username}</p>
                    )}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-3 space-y-6">
          {result ? (
            <>
              {/* Original Thread */}
              <Card className="bg-white border-gray-200">
              <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-gray-900 flex items-center">
                      <Twitter className="w-5 h-5 mr-2" />
                      Original Thread
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyAll(result.data.original, 'original')}
                    >
                    <Copy className="w-4 h-4 mr-1" />
                      Copy All
                  </Button>
                  </div>
              </CardHeader>
              <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {result.data.original.map((tweet, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            {index + 1}/{result.data.original.length}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {tweet.length}/280
                          </Badge>
                        </div>
                        <p className="text-gray-800 text-sm whitespace-pre-wrap mb-2">
                          {tweet}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyTweet(tweet, index, 'original')}
                          className="text-gray-500 hover:text-gray-700 text-xs"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

              {/* Rewritten Thread */}
              <Card className="bg-white border-gray-200">
              <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-gray-900 flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
                      Rewritten Thread
                    </CardTitle>
                  <div className="flex space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCopyAll(result.data.rewritten, 'rewritten')}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-900"
                      >
                      <Copy className="w-4 h-4 mr-1" />
                        Copy All
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleReplaceOriginal}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Replace Original
                    </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleSave}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleRewrite()}
                        disabled={isRewriting}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Regenerate
                      </Button>
                    </div>
                  </div>
              </CardHeader>
              <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {result.data.rewritten.map((tweet, index) => (
                      <div key={index} className="border border-blue-200 rounded-lg p-3 bg-blue-50">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs bg-blue-100 border-blue-300">
                            {index + 1}/{result.data.rewritten.length}
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-blue-100 border-blue-300">
                            {tweet.length}/280
                          </Badge>
                </div>
                        <p className="text-gray-800 text-sm whitespace-pre-wrap mb-2">
                          {tweet}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyTweet(tweet, index, 'rewritten')}
                          className="text-blue-600 hover:text-blue-700 text-xs"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                  </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="bg-white border-gray-200">
              <CardContent className="text-center py-12">
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                    <Edit3 className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Ready to Rewrite Your Thread?
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Paste your existing thread content or URL, choose a rewrite style, 
                      and let our AI transform it into something amazing.
                    </p>
                  </div>
                  <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Zap className="w-4 h-4 mr-1" />
                      AI-Powered
                    </div>
                    <div className="flex items-center">
                      <ArrowRight className="w-4 h-4 mr-1" />
                      Multiple Styles
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      Style Mimicking
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

export default ThreadRewriter;
