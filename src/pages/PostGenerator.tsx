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
  MessageSquare,
  TrendingUp,
  Eye,
  Lightbulb,
  Sparkles,
  User,
  Target,
  Hash,
  Heart,
  Share,
  BarChart3
} from 'lucide-react';
import { usePostGenerator } from '@/hooks/usePostGenerator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { saveContent } from '@/lib/api';

const PostGenerator = () => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('');
  const [writingStyleHandle, setWritingStyleHandle] = useState('');
  const [goal, setGoal] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  
  const {
    generatePosts,
    generateIdeas,
    isGenerating,
    isGeneratingIdeas,
    result,
    ideas,
    error,
    clearError,
    clearResult,
    clearIdeas,
    validateTwitterHandle,
    formatTwitterHandle
  } = usePostGenerator();

  const toneOptions = [
    { value: 'smart', label: 'Smart', icon: '🧠', description: 'Intelligent and insightful' },
    { value: 'funny', label: 'Funny', icon: '😄', description: 'Humorous and entertaining' },
    { value: 'punchy', label: 'Punchy', icon: '👊', description: 'Bold and impactful' },
    { value: 'viral', label: 'Viral', icon: '🚀', description: 'Designed to spread' },
    { value: 'contrarian', label: 'Contrarian', icon: '🔄', description: 'Challenges common views' },
    { value: 'emotional', label: 'Emotional', icon: '❤️', description: 'Touches the heart' }
  ];

  const goalOptions = [
    { value: 'replies', label: 'Get Replies', icon: MessageSquare, description: 'Encourage engagement' },
    { value: 'clicks', label: 'Drive Clicks', icon: Eye, description: 'Generate traffic' },
    { value: 'lesson', label: 'Share a Lesson', icon: Lightbulb, description: 'Educate audience' },
    { value: 'debate', label: 'Start a Debate', icon: BarChart3, description: 'Spark discussion' },
    { value: 'viral', label: 'Go Viral', icon: TrendingUp, description: 'Maximum reach' }
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Missing topic",
        description: "Please enter a topic for your post.",
        variant: "destructive",
      });
      return;
    }

    try {
      await generatePosts(
        topic.trim(),
        tone || undefined,
        writingStyleHandle.trim() || undefined,
        goal || undefined
      );
      toast({
        title: "Posts generated!",
        description: "Your viral posts are ready to share.",
      });
    } catch (error: any) {
      console.error('Error generating posts:', error);
      // Error is already handled by the hook
    }
  };

  const handleGenerateIdeas = async () => {
    if (!writingStyleHandle.trim()) {
      toast({
        title: "Missing handle",
        description: "Please enter a Twitter handle to generate ideas from.",
        variant: "destructive",
      });
      return;
    }

    try {
      await generateIdeas(writingStyleHandle.trim());
      toast({
        title: "Ideas generated!",
        description: "Post ideas based on the creator's style are ready.",
      });
    } catch (error: any) {
      console.error('Error generating ideas:', error);
      // Error is already handled by the hook
    }
  };

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied!",
        description: "Post copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async (content: string, type: 'post' | 'idea') => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save content.",
        variant: "destructive",
      });
      return;
    }

    try {
      await saveContent({
        type: 'post',
        title: type === 'post' ? `Post: ${topic}` : `Idea: ${content.substring(0, 50)}...`,
        content,
        user_id: user.id
      });
      
      toast({
        title: "Saved!",
        description: "Content saved to your library.",
      });
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error.message || "Failed to save content.",
        variant: "destructive",
      });
    }
  };

  const handleUseIdea = (idea: string) => {
    setTopic(idea);
    clearIdeas();
    toast({
      title: "Idea applied!",
      description: "The idea has been set as your topic.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Post Generator</h1>
        <p className="text-gray-500">Create viral X posts that engage your audience</p>
      </div>

      {/* Input Section */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
            Generate Viral Posts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Topic Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Post Topic <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="What do you want to post about? (e.g., 'The future of AI in marketing')"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 min-h-[80px]"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              Be specific about your topic for better results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tone Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tone (Optional)
              </label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="Select a tone" />
                </SelectTrigger>
                <SelectContent>
                  {toneOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center space-x-2">
                        <span>{option.icon}</span>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Goal Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Post Goal (Optional)
              </label>
              <Select value={goal} onValueChange={setGoal}>
                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="Select a goal" />
                </SelectTrigger>
                <SelectContent>
                  {goalOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center space-x-2">
                          <Icon className="w-4 h-4" />
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-gray-500">{option.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Writing Style Handle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Writing Style Handle (Optional)
            </label>
            <div className="relative">
              <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="@username or username"
                value={writingStyleHandle}
                onChange={(e) => setWritingStyleHandle(e.target.value)}
                className="pl-10 bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Mimic the writing style of a specific creator
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleGenerate} 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isGenerating || !topic.trim()}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating posts...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Posts
                </>
              )}
            </Button>

            <Button 
              onClick={handleGenerateIdeas} 
              variant="outline"
              className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
              disabled={isGeneratingIdeas || !writingStyleHandle.trim()}
            >
              {isGeneratingIdeas ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating ideas...
                </>
              ) : (
                <>
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Generate Post Ideas
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearError}
              className="ml-2 h-auto p-0 text-red-600 hover:text-red-700"
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Post Ideas Results */}
      {ideas && ideas.data && (
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
              Post Ideas from @{ideas.data.creatorInfo.username}
            </CardTitle>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>{ideas.data.creatorInfo.name}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Twitter className="w-4 h-4" />
                <span>{ideas.data.creatorInfo.followers_count.toLocaleString()} followers</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ideas.data.ideas.map((idea, index) => (
                <Card key={index} className="bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer border-gray-200">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-700 mb-3 line-clamp-3">{typeof idea === 'string' ? idea : (idea?.text || JSON.stringify(idea))}</p>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUseIdea(idea)}
                        className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        <Hash className="w-3 h-3 mr-1" />
                        Use Idea
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopy(idea)}
                        className="border-gray-200 text-gray-600 hover:bg-gray-50"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearIdeas}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear Ideas
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Posts Results */}
      {result && result.data && (
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-green-600" />
              Generated Posts
            </CardTitle>
            <div className="flex flex-wrap gap-2 mt-2">
              {result.data.tone && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {toneOptions.find(t => t.value === result.data.tone)?.label || result.data.tone}
                </Badge>
              )}
              {result.data.goal && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  {goalOptions.find(g => g.value === result.data.goal)?.label || result.data.goal}
                </Badge>
              )}
              {result.data.writingStyleHandle && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  Style: {result.data.writingStyleHandle}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.data.variations.map((post, index) => (
                <Card key={index} className="bg-gray-50 border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="outline" className="bg-white border-gray-300 text-gray-600">
                        Variation {index + 1}
                      </Badge>
                      <div className="text-xs text-gray-500">
                        {post.length} characters
                      </div>
                    </div>
                    <p className="text-gray-900 whitespace-pre-wrap mb-4 leading-relaxed">
                      {typeof post === 'string' ? post : (post?.text || JSON.stringify(post))}
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopy(post)}
                        className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-100"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSave(post, 'post')}
                        className="flex-1 border-green-200 text-green-600 hover:bg-green-50"
                      >
                        <Save className="w-3 h-3 mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleGenerate}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {result.data.mimicUserInfo && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Style Analysis</h4>
                <div className="flex items-center space-x-4 text-sm text-blue-700">
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{result.data.mimicUserInfo.name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Twitter className="w-4 h-4" />
                    <span>@{result.data.mimicUserInfo.username}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="w-4 h-4" />
                    <span>{result.data.mimicUserInfo.followers_count.toLocaleString()} followers</span>
                  </div>
                </div>
                {result.data.mimicUserInfo.description && (
                  <p className="text-sm text-blue-600 mt-2">{result.data.mimicUserInfo.description}</p>
                )}
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearResult}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear Results
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
            Pro Tips for Viral Posts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Use specific, relatable examples in your posts</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Ask questions to encourage engagement</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Share personal insights and experiences</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Use emojis strategically for visual appeal</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Post at optimal times for your audience</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Test different tones and styles</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostGenerator; 