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
  Link, 
  Zap, 
  Twitter,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  TrendingUp,
  Eye,
  Lightbulb
} from 'lucide-react';
import { useReplyGenerator } from '@/hooks/useReplyGenerator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { saveContent } from '@/lib/api';

const ReplyGenerator = () => {
  const [inputType, setInputType] = useState('url'); // 'url' or 'text'
  const [tweetUrl, setTweetUrl] = useState('');
  const [postContent, setPostContent] = useState('');
  const [goal, setGoal] = useState('');
  const [context, setContext] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  
  const {
    generateReplies,
    isGenerating,
    result,
    error,
    clearError,
    clearResult,
    validateTweetUrl,
    formatTweetUrl
  } = useReplyGenerator();

  const replyStyles = {
    contrarian: {
      name: 'Contrarian',
      icon: '🔥',
      color: 'bg-red-100 text-red-800 border-red-200',
      description: 'Challenge with a bold counter-perspective'
    },
    insight: {
      name: 'Insight',
      icon: '💡',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      description: 'Drop a surprising truth that reframes everything'
    },
    story: {
      name: 'Story',
      icon: '📖',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      description: 'Share a quick, relatable micro-story'
    },
    question: {
      name: 'Question',
      icon: '❓',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      description: 'Ask something that makes people stop scrolling'
    }
  };

  const handleGenerate = async () => {
    if (inputType === 'url') {
      if (!tweetUrl.trim()) {
        toast({
          title: "Missing tweet URL",
          description: "Please enter a valid Twitter/X post URL.",
          variant: "destructive",
        });
        return;
      }

      const formattedUrl = formatTweetUrl(tweetUrl.trim());
      if (!validateTweetUrl(formattedUrl)) {
        toast({
          title: "Invalid URL",
          description: "Please enter a valid Twitter/X post URL.",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!postContent.trim()) {
        toast({
          title: "Missing post content",
          description: "Please enter the post content you want to reply to.",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      await generateReplies(
        inputType === 'url' ? tweetUrl.trim() : undefined,
        inputType === 'text' ? postContent.trim() : undefined,
        goal.trim() || undefined,
        context.trim() || undefined
      );
      toast({
        title: "Viral replies generated!",
        description: "Your scroll-stopping replies are ready in 4 different styles.",
      });
    } catch (error: any) {
      console.error('Error generating replies:', error);
      // Error is already handled by the hook
    }
  };

  const handleCopy = async (content: string, style: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied!",
        description: `${replyStyles[style as keyof typeof replyStyles].name} reply copied to clipboard.`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async (content: string, style: string) => {
    if (!user) return;

    try {
      await saveContent({
        user_id: user.id,
        type: 'reply',
        title: result?.data.original_tweet.author 
          ? `${replyStyles[style as keyof typeof replyStyles].name} Reply to @${result?.data.original_tweet.author.username}`
          : `${replyStyles[style as keyof typeof replyStyles].name} Reply to Post`,
        content: content,
        metadata: { 
          ...(result?.data.original_tweet.url && { tweet_url: result.data.original_tweet.url }),
          ...(result?.data.original_tweet.author && {
            author_username: result.data.original_tweet.author.username,
            author_name: result.data.original_tweet.author.name,
            author_followers: result.data.original_tweet.author.followers
          }),
          goal, 
          style,
        }
      });
      toast({
        title: "Saved!",
        description: `${replyStyles[style as keyof typeof replyStyles].name} reply saved to your library.`,
      });
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error.message || "Failed to save reply.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Viral Reply Generator</h1>
        <p className="text-gray-600">Create scroll-stopping replies that spark curiosity and increase visibility</p>
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
        {/* Input section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white border-gray-200">
          <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Link className="w-5 h-5 mr-2" />
                Reply Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Input Type
              </label>
                <div className="flex space-x-4">
                  <Button
                    variant={inputType === 'url' ? 'default' : 'outline'}
                    onClick={() => setInputType('url')}
                    className="flex-1"
                  >
                    <Link className="w-4 h-4 mr-2" />
                    Tweet URL
                  </Button>
                  <Button
                    variant={inputType === 'text' ? 'default' : 'outline'}
                    onClick={() => setInputType('text')}
                    className="flex-1"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Direct Text
                  </Button>
                </div>
              </div>

              {inputType === 'url' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tweet URL
                  </label>
                  <Input
                    placeholder="https://twitter.com/user/status/123456789"
                    value={tweetUrl}
                    onChange={(e) => setTweetUrl(e.target.value)}
                    className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Paste the full Twitter/X post URL
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Post Content
                  </label>
                  <Textarea
                    placeholder="Paste or type the post content you want to reply to..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the text you want to generate replies for
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goal (Optional)
                </label>
                <Textarea
                  placeholder="e.g., Start a conversation about AI, Get noticed by industry leaders, Build my personal brand..."
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  What do you want to achieve with your reply?
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Context (Optional)
                </label>
                <Textarea
                  placeholder="e.g., I'm a developer, I work in marketing, I'm building a startup..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  rows={2}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Brief context about yourself
                </p>
            </div>

            <Button 
              onClick={handleGenerate} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isGenerating || (inputType === 'url' ? !tweetUrl.trim() : !postContent.trim())}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing & generating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                    Generate Viral Replies
                </>
              )}
            </Button>

              {result && result.data.original_tweet.author && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center text-green-800 mb-2">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span className="font-medium">Analysis Complete</span>
                  </div>
                  <div className="text-sm text-green-700 space-y-1">
                    <p><strong>Original:</strong> {result.data.original_tweet.author.name} (@{result.data.original_tweet.author.username})</p>
                    <p><strong>Followers:</strong> {result.data.original_tweet.author.followers?.toLocaleString()}</p>
                    <p><strong>Engagement:</strong> {result.data.original_tweet.metrics?.like_count} likes, {result.data.original_tweet.metrics?.retweet_count} retweets</p>
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
        </div>

        {/* Output section */}
        <div className="lg:col-span-3">
          {result ? (
              <div className="space-y-4">
                    <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Viral Replies</h2>
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

              {/* Original Tweet/Post Display */}
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="pt-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 rounded-full p-2">
                      {result.data.original_tweet.author ? (
                        <Twitter className="w-4 h-4 text-blue-600" />
                      ) : (
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      {result.data.original_tweet.author ? (
                        <>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-gray-900">{result.data.original_tweet.author.name}</span>
                            <span className="text-gray-500">@{result.data.original_tweet.author.username}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-500 text-sm">{result.data.original_tweet.author.followers?.toLocaleString()} followers</span>
                          </div>
                          <p className="text-gray-800 mb-2">{result.data.original_tweet.text}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{result.data.original_tweet.metrics?.like_count} likes</span>
                            <span>{result.data.original_tweet.metrics?.retweet_count} retweets</span>
                            <span>{result.data.original_tweet.metrics?.reply_count} replies</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-gray-900">Original Post</span>
                          </div>
                          <p className="text-gray-800">{result.data.original_tweet.text}</p>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(result.data.replies).map(([style, content]) => {
                  const styleConfig = replyStyles[style as keyof typeof replyStyles];
                  return (
                    <Card key={style} className="bg-white border-gray-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="mr-2">{styleConfig.icon}</span>
                            {styleConfig.name}
                          </div>
                          <Badge variant="outline" className={styleConfig.color}>
                            {content.length}/280
                      </Badge>
                        </CardTitle>
                        <p className="text-xs text-gray-600">{styleConfig.description}</p>
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
                            onClick={() => handleCopy(content, style)}
                            className="flex-1"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleSave(content, style)}
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

              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <div className="bg-orange-100 rounded-full p-2">
                      <TrendingUp className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-orange-900 mb-1">Viral Reply Tips</h3>
                      <ul className="text-sm text-orange-800 space-y-1">
                        <li>• Reply within the first hour for maximum visibility</li>
                        <li>• Engage with other replies to boost your comment's reach</li>
                        <li>• Use contrarian takes on popular posts for more engagement</li>
                        <li>• Questions and stories tend to get more replies than statements</li>
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
                      Ready to Create Viral Replies?
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Paste any Twitter/X post URL or enter direct text and get 4 scroll-stopping replies designed to 
                      spark curiosity and increase your visibility.
                    </p>
                  </div>
                  <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      Viral Potential
                    </div>
                    <div className="flex items-center">
                      <Lightbulb className="w-4 h-4 mr-1" />
                      Sharp Insights
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Growth Focused
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

export default ReplyGenerator;
