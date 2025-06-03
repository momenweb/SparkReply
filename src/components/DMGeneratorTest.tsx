import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDMGenerator } from '@/hooks/useDMGenerator';

export default function DMGeneratorTest() {
  const [handle, setHandle] = useState('elonmusk');
  const [goal, setGoal] = useState('Get them to try our new AI DM outreach tool');
  
  const {
    generateDMs,
    isGenerating,
    result,
    error,
    clearError
  } = useDMGenerator();

  const handleTest = async () => {
    try {
      await generateDMs(handle, goal);
    } catch (err) {
      console.error('Test failed:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>DM Generator API Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Handle</label>
            <Input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="elonmusk"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Goal</label>
            <Textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="What do you want to achieve?"
              rows={3}
            />
          </div>
          
          <Button 
            onClick={handleTest} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? 'Generating...' : 'Test DM Generation'}
          </Button>
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">Error:</p>
              <p className="text-red-700">{error}</p>
              <Button variant="outline" size="sm" onClick={clearError} className="mt-2">
                Clear Error
              </Button>
            </div>
          )}
          
          {result && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">Target User Info:</h3>
                <p><strong>Name:</strong> {result.data.target_user.name}</p>
                <p><strong>Username:</strong> @{result.data.target_user.username}</p>
                <p><strong>Followers:</strong> {result.data.target_user.followers?.toLocaleString()}</p>
                {result.data.target_user.bio && (
                  <p><strong>Bio:</strong> {result.data.target_user.bio}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(result.data.dms).map(([tone, content]) => (
                  <Card key={tone}>
                    <CardHeader>
                      <CardTitle className="text-sm capitalize">{tone}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap">{content}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {content.length}/280 characters
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 