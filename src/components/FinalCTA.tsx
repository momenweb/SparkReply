import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const FinalCTA = () => {
  return (
    <section className="py-24 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600">
      <div className="container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Ready to spark real conversations on X?
          </h2>
          
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of creators who've transformed their X presence with AI-powered content
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/signup">
              <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg rounded-xl font-semibold flex items-center group shadow-lg">
                Try SparkReply now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <div className="text-blue-100 text-sm">
              ✨ No credit card required • Start in 30 seconds
            </div>
          </div>
          
          <div className="mt-12 flex justify-center flex-wrap gap-6">
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-blue-50 text-sm">🚀 Instant setup</div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-blue-50 text-sm">💬 Personal DMs</div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-blue-50 text-sm">🧵 Viral threads</div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-blue-50 text-sm">⚡ Smart replies</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
