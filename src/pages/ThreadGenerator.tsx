import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Save, RefreshCw, FileText, Zap, Edit } from 'lucide-react';
import { generateThread, saveContent } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const ThreadGenerator = () => {
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('');
  const [threadLength, setThreadLength] = useState('medium');
  const [thread, setThread] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const lengths = [
    { id: 'short', name: 'Short (5-7 tweets)', color: 'bg-green-600' },
    { id: 'medium', name: 'Medium (8-12 tweets)', color: 'bg-blue-600' },
    { id: 'long', name: 'Long (13-20 tweets)', color: 'bg-purple-600' },
  ];

  const handleGenerate = async () => {
    if (!topic) {
      toast({
        title: "Missing topic",
        description: "Please enter a topic for your thread.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const generatedThread = await generateThread(topic, threadLength, style);
      setThread(generatedThread);
      toast({
        title: "Thread generated!",
        description: "Your viral thread is ready.",
      });
    } catch (error: any) {
      console.error('Error generating thread:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate thread. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyThread = async () => {
    try {
      const fullThread = thread.join('\n\n');
      await navigator.clipboard.writeText(fullThread);
      toast({
        title: "Copied!",
        description: "Full thread copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleCopyTweet = async (tweet: string) => {
    try {
      await navigator.clipboard.writeText(tweet);
      toast({
        title: "Copied!",
        description: "Tweet copied to clipboard.",
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
    if (!user || thread.length === 0) return;

    try {
      await saveContent({
        user_id: user.id,
        type: 'thread',
        title: `Thread: ${topic.substring(0, 50)}...`,
        content: thread.join('\n\n'),
        metadata: { topic, style, length: threadLength, tweet_count: thread.length }
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Thread Generator</h1>
        <p className="text-gray-400">Create viral X threads that engage your audience</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input section */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Thread Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Topic or Main Idea
              </label>
              <Textarea
                placeholder="e.g., Why most startups fail at content marketing..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Style Inspiration (optional)
              </label>
              <Input
                placeholder="@username or describe writing style"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Thread Length
              </label>
              <div className="flex flex-wrap gap-2">
                {lengths.map((length) => (
                  <Button
                    key={length.id}
                    variant={threadLength === length.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setThreadLength(length.id)}
                    className={threadLength === length.id ? `${length.color} text-white` : "border-gray-600 text-gray-300 hover:text-white"}
                  >
                    {length.name}
                  </Button>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleGenerate} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isGenerating || !topic}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating Thread...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Thread
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output section */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Generated Thread
              </span>
              {thread.length > 0 && (
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={handleCopyThread}>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy All
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSave}>
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {thread.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {thread.map((tweet, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs text-blue-400 font-mono">Tweet {index + 1}</span>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => handleCopyTweet(tweet)}>
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{tweet}</p>
                  </div>
                ))}
                <Button size="sm" onClick={handleGenerate} className="w-full bg-blue-600 hover:bg-blue-700">
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Regenerate Thread
                </Button>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Enter your topic and click "Generate Thread" to create a viral thread</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ThreadGenerator;
