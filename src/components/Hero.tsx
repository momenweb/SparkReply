import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, MessageCircle, Users, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  const [currentWord, setCurrentWord] = useState(0);
  const words = ['DMs', 'Threads', 'Replies'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [words.length]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <section className="pt-32 pb-32 bg-gradient-to-br from-white via-blue-50 to-purple-50 overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-400 rounded-full opacity-10"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-400 rounded-full opacity-10"></div>
        <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-yellow-400 rounded-full opacity-20"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Content */}
          <div className="text-center lg:text-left">
            <div className="mb-8 inline-block bg-blue-100 text-blue-700 py-2 px-5 rounded-full text-sm font-medium">
              AI-Powered Social Media Assistant
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-8 leading-tight text-gray-900">
              Cold <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{words[currentWord]}</span> that feel warm.
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl">
              AI-crafted content that gets attention on X — in your authentic voice.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 mb-10">
            <Link to="/signup">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="bg-white text-gray-700 border-gray-300 hover:bg-gray-100 px-8 py-6 text-lg rounded-xl"
                onClick={() => scrollToSection('how-it-works')}
              >
                See How It Works
              </Button>
            </div>
            <div className="mt-10">
              <p className="text-gray-600 mb-6 flex items-center justify-center lg:justify-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>No credit card required</span>
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 mt-8">
                <div className="flex items-center">
                  <div className="flex -space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm">YC</div>
                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm">TC</div>
                    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white text-sm">GH</div>
                  </div>
                  <div className="ml-4 text-sm text-gray-600">Trusted by founders and creators</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Illustration */}
          <div className="relative">
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
              <div className="space-y-8">
                {/* AI Brain illustration */}
                <div className="flex justify-center mb-10">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Sparkles className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-pulse"></div>
                    <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-green-400 rounded-full animate-pulse delay-300"></div>
                  </div>
                </div>

                {/* Content examples */}
                <div className="space-y-3">
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center mb-2">
                      <MessageCircle className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">DM</span>
                    </div>
                    <p className="text-gray-800 text-sm leading-relaxed">"Hey! Loved your AI insights. Quick question about scaling..."</p>
                  </div>

                  <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                    <div className="flex items-center mb-2">
                      <Users className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Thread</span>
                    </div>
                    <p className="text-gray-800 text-sm leading-relaxed">"5 lessons from building a $1M SaaS 🧵"</p>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                    <div className="flex items-center mb-2">
                      <TrendingUp className="w-4 h-4 text-purple-600 mr-2" />
                      <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Reply</span>
                    </div>
                    <p className="text-gray-800 text-sm leading-relaxed">"This resonates! We saw similar patterns..."</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
