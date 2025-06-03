import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

const DemoPreview = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowResult(true);
    }, 2000);
  };

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="bg-blue-100 text-blue-600 rounded-full px-4 py-1 text-sm font-medium mb-4 inline-block">Live Demo</span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">See It In Action</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Watch SparkReply generate a personalized DM in real-time
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-50 rounded-xl p-8 shadow-lg border border-gray-200">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Target X Handle</label>
              <input 
                type="text" 
                value="@elonmusk"
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-800"
                readOnly
              />
            </div>
            
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-blue-600 hover:bg-blue-700 py-3 text-white"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center">
                  <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                  Generating...
                </div>
              ) : 'Generate Personalized DM'}
            </Button>
            
            {isGenerating && (
              <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            )}
            
            {showResult && !isGenerating && (
              <div className="mt-6 p-6 bg-white rounded-lg border-l-4 border-blue-500 shadow-md">
                <h4 className="font-semibold mb-3 text-blue-600">Generated DM:</h4>
                <p className="text-gray-800 leading-relaxed">
                  "Hey Elon! 👋 Loved your recent tweet about first principles thinking. I'm building something that applies this exact approach to content creation - using AI to break down what makes great X content work, then rebuilding it from the ground up. Would love to get your thoughts on how we're approaching the intersection of AI and authentic communication. Quick 5-min call this week?"
                </p>
                <div className="mt-4 text-sm text-gray-500 flex items-center">
                  <Sparkles className="w-4 h-4 text-blue-500 mr-2" />
                  Personalized based on recent tweets about first principles and AI
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoPreview;
