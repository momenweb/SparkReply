import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Save, RefreshCw, Edit, Zap, FileText } from 'lucide-react';
import { rewriteThread, saveContent } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const ThreadRewriter = () => {
  const [originalThread, setOriginalThread] = useState('');
  const [newTone, setNewTone] = useState('engaging');
  const [rewrittenThread, setRewrittenThread] = useState<string[]>([]);
  const [isRewriting, setIsRewriting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const tones = [
    { id: 'engaging', name: 'Engaging', color: 'bg-blue-600' },
    { id: 'professional', name: 'Professional', color: 'bg-gray-600' },
    { id: 'casual', name: 'Casual', color: 'bg-green-600' },
    { id: 'authoritative', name: 'Authoritative', color: 'bg-purple-600' },
    { id: 'storytelling', name: 'Storytelling', color: 'bg-orange-600' },
    { id: 'educational', name: 'Educational', color: 'bg-indigo-600' },
  ];

  const handleRewrite = async () => {
    if (!originalThread) {
      toast({
        title: "Missing content",
        description: "Please paste your original thread.",
        variant: "destructive",
      });
      return;
    }

    setIsRewriting(true);
    try {
      const rewritten = await rewriteThread(originalThread, newTone);
      setRewrittenThread(rewritten);
      toast({
        title: "Thread rewritten!",
        description: "Your improved thread is ready.",
      });
    } catch (error: any) {
      console.error('Error rewriting thread:', error);
      toast({
        title: "Rewrite failed",
        description: error.message || "Failed to rewrite thread. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRewriting(false);
    }
  };

  const handleCopyThread = async () => {
    try {
      const fullThread = rewrittenThread.join('\n\n');
      await navigator.clipboard.writeText(fullThread);
      toast({
        title: "Copied!",
        description: "Rewritten thread copied to clipboard.",
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
    if (!user || rewrittenThread.length === 0) return;

    try {
      await saveContent({
        user_id: user.id,
        type: 'thread',
        title: `Rewritten Thread - ${newTone}`,
        content: rewrittenThread.join('\n\n'),
        metadata: { 
          original_thread: originalThread, 
          new_tone: newTone, 
          tweet_count: rewrittenThread.length,
          type: 'rewritten'
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Thread Rewriter</h1>
        <p className="text-gray-400">Transform existing threads with new tones and improved structure</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input section */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Edit className="w-5 h-5 mr-2" />
              Original Thread
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Paste your original thread
              </label>
              <Textarea
                placeholder="Paste your existing thread here... Each tweet should be on a new line or separated by numbers (1/, 2/, etc.)"
                value={originalThread}
                onChange={(e) => setOriginalThread(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                rows={8}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                New Tone & Style
              </label>
              <div className="flex flex-wrap gap-2">
                {tones.map((tone) => (
                  <Button
                    key={tone.id}
                    variant={newTone === tone.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewTone(tone.id)}
                    className={newTone === tone.id ? `${tone.color} text-white` : "border-gray-600 text-gray-300 hover:text-white"}
                  >
                    {tone.name}
                  </Button>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleRewrite} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isRewriting || !originalThread}
            >
              {isRewriting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Rewriting Thread...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Rewrite Thread
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
                Rewritten Thread
              </span>
              {rewrittenThread.length > 0 && (
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
            {rewrittenThread.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {rewrittenThread.map((tweet, index) => (
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
                <Button size="sm" onClick={handleRewrite} className="w-full bg-blue-600 hover:bg-blue-700">
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Rewrite Again
                </Button>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Edit className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Paste your original thread and select a new tone to get started</p>
                <p className="text-sm mt-2">AI will improve structure, hooks, and engagement while maintaining your core message</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ThreadRewriter;
