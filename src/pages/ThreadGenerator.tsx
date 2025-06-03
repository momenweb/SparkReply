import { useState, useEffect } from 'react';
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
  MessageSquare,
  TrendingUp,
  Eye,
  Lightbulb,
  Shuffle,
  User,
  Target,
  Hash,
  Sparkles
} from 'lucide-react';
import { useThreadGenerator } from '@/hooks/useThreadGenerator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { saveContent } from '@/lib/api';

const ThreadGenerator = () => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [handleToMimic, setHandleToMimic] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  
  const {
    generateThread,
    isGenerating,
    result,
    error,
    clearError,
    clearResult,
    trendingTopics,
    viralPosts,
    loadTrendingTopics,
    getRandomTopic,
    isLoadingTrends
  } = useThreadGenerator();

  // Load trending topics on component mount
  useEffect(() => {
    loadTrendingTopics();
  }, [loadTrendingTopics]);

  const toneOptions = [
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual & Friendly' },
    { value: 'humorous', label: 'Humorous' },
    { value: 'inspirational', label: 'Inspirational' },
    { value: 'educational', label: 'Educational' },
    { value: 'controversial', label: 'Controversial' },
    { value: 'storytelling', label: 'Storytelling' },
    { value: 'data-driven', label: 'Data-Driven' }
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Missing topic",
        description: "Please enter a topic for your thread.",
        variant: "destructive",
      });
      return;
    }

    try {
      await generateThread(
        topic.trim(),
        tone || undefined,
        targetAudience.trim() || undefined,
        handleToMimic.trim() || undefined
      );
      toast({
        title: "Thread generated!",
        description: "Your viral thread is ready to share.",
      });
    } catch (error: any) {
      console.error('Error generating thread:', error);
      // Error is already handled by the hook
    }
  };

  const handleCopyAll = async () => {
    if (!result?.data.thread) return;

    try {
      const threadText = result.data.thread
        .map((tweet, index) => `${index + 1}/${result.data.thread.length} ${tweet}`)
        .join('\n\n');
      
      await navigator.clipboard.writeText(threadText);
      toast({
        title: "Copied!",
        description: "Thread copied to clipboard with numbering.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleCopyTweet = async (tweet: string, index: number) => {
    try {
      await navigator.clipboard.writeText(tweet);
      toast({
        title: "Copied!",
        description: `Tweet ${index + 1} copied to clipboard.`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!user || !result?.data.thread) return;

    try {
      await saveContent({
        user_id: user.id,
        type: 'thread',
        title: `Thread: ${result.data.topic}`,
        content: result.data.thread.join('\n\n'),
        metadata: { 
          topic: result.data.topic,
          tone: result.data.tone,
          targetAudience: result.data.targetAudience,
          handleToMimic: result.data.handleToMimic,
          threadLength: result.data.threadLength,
          mimicUserInfo: result.data.mimicUserInfo
        }
      });
      toast({
        title: "Saved!",
        description: "Thread saved to your library.",
      });
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error.message || "Failed to save thread.",
        variant: "destructive",
      });
    }
  };

  const handleRandomTopic = () => {
    const randomTopic = getRandomTopic();
    setTopic(randomTopic);
    toast({
      title: "Random topic selected!",
      description: "Feel free to modify it to your liking.",
    });
  };

  const handleTrendingTopicClick = (topicName: string) => {
    setTopic(topicName);
    toast({
      title: "Topic selected!",
      description: `"${topicName}" added as your thread topic.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Thread Generator</h1>
        <p className="text-gray-600">Create viral X (Twitter) threads that capture attention and drive engagement</p>
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
                <MessageSquare className="w-5 h-5 mr-2" />
                Thread Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topic or Idea *
                </label>
                <div className="flex space-x-2">
                  <Textarea
                    placeholder="e.g., The future of AI, Building habits that stick, Why most startups fail..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 flex-1"
                    rows={3}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRandomTopic}
                    disabled={isLoadingTrends}
                    className="self-start"
                  >
                    <Shuffle className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  What topic should your thread cover?
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tone or Style
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
                  Choose the tone for your thread
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience
                </label>
                <Input
                  placeholder="e.g., Entrepreneurs, Developers, Marketers, Students..."
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Who is your target audience? (optional)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Handle to Mimic Style
                </label>
                <Input
                  placeholder="@username or username"
                  value={handleToMimic}
                  onChange={(e) => setHandleToMimic(e.target.value)}
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Mimic the writing style of a specific user (optional)
                </p>
              </div>

              <Button 
                onClick={handleGenerate} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isGenerating || !topic.trim()}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating thread...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Viral Thread
                  </>
                )}
              </Button>

              {result && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center text-green-800 mb-2">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span className="font-medium">Thread Generated</span>
                  </div>
                  <div className="text-sm text-green-700 space-y-1">
                    <p><strong>Topic:</strong> {result.data.topic}</p>
                    <p><strong>Length:</strong> {result.data.threadLength} tweets</p>
                    {result.data.tone && <p><strong>Tone:</strong> {result.data.tone}</p>}
                    {result.data.mimicUserInfo && (
                      <p><strong>Style:</strong> Mimicking @{result.data.mimicUserInfo.username}</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trending Topics */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Trending Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingTrends ? (
                <div className="flex items-center justify-center py-4">
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  <span className="text-sm text-gray-500">Loading trends...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Popular Topics</h4>
                    <div className="flex flex-wrap gap-2">
                      {trendingTopics.slice(0, 5).map((topic, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="cursor-pointer hover:bg-blue-50 hover:border-blue-300"
                          onClick={() => handleTrendingTopicClick(topic.name)}
                        >
                          <Hash className="w-3 h-3 mr-1" />
                          {topic.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Viral Ideas</h4>
                    <div className="space-y-1">
                      {viralPosts.slice(0, 3).map((post, index) => (
                        <button
                          key={index}
                          onClick={() => handleTrendingTopicClick(post)}
                          className="text-left text-xs text-gray-600 hover:text-blue-600 hover:underline block w-full"
                        >
                          {post}
                        </button>
                      ))}
                    </div>
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
                <h2 className="text-xl font-semibold text-gray-900">Generated Thread</h2>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyAll}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSave}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save to Library
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerate()}
                    disabled={isGenerating}
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Regenerate
                  </Button>
                </div>
              </div>

              {/* Thread Display */}
              <div className="space-y-3">
                {result.data.thread.map((tweet, index) => (
                  <Card key={index} className="bg-white border-gray-200">
                    <CardContent className="pt-4">
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                          <Twitter className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-gray-900">Your Thread</span>
                            <Badge variant="outline" className="text-xs">
                              {index + 1}/{result.data.threadLength}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {tweet.length}/280
                            </Badge>
                          </div>
                          <p className="text-gray-800 whitespace-pre-wrap mb-3">
                            {tweet}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyTweet(tweet, index)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy Tweet
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <div className="bg-orange-100 rounded-full p-2">
                      <Sparkles className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-orange-900 mb-1">Thread Tips</h3>
                      <ul className="text-sm text-orange-800 space-y-1">
                        <li>• Post the first tweet and reply with the rest in sequence</li>
                        <li>• Use "🧵" or "Thread:" in your first tweet to signal a thread</li>
                        <li>• Engage with replies to boost visibility</li>
                        <li>• Pin the thread to your profile if it performs well</li>
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
                      Ready to Create a Viral Thread?
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Enter a topic and let our AI create a compelling thread that captures attention 
                      and drives engagement on X (Twitter).
                    </p>
                  </div>
                  <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      Viral Potential
                    </div>
                    <div className="flex items-center">
                      <Lightbulb className="w-4 h-4 mr-1" />
                      AI-Powered
                    </div>
                    <div className="flex items-center">
                      <Target className="w-4 h-4 mr-1" />
                      Engagement Focused
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

export default ThreadGenerator;
