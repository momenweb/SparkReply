import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, CheckCircle, Users, Zap, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const FinalCTA = () => {
  return (
    <section className="py-32 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-400 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-yellow-400 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Icon and badge */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center backdrop-blur-sm shadow-2xl">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce"></div>
            </div>
          </div>
          
          <div className="mb-6 inline-block bg-white/10 backdrop-blur-sm text-white py-2 px-6 rounded-full text-sm font-medium border border-white/20">
            🚀 Join 10,000+ creators already using SparkReply
          </div>
          
          <h2 className="text-4xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Stop struggling with
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              X content creation
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform your X presence in minutes, not hours. Generate viral DMs, engaging threads, and smart replies that actually get results.
          </p>
          
          {/* Stats row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-center mb-3">
                <Users className="w-8 h-8 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">10,000+</div>
              <div className="text-blue-200 text-sm">Active creators</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-center mb-3">
                <MessageCircle className="w-8 h-8 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">1M+</div>
              <div className="text-blue-200 text-sm">Content pieces generated</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-center mb-3">
                <Zap className="w-8 h-8 text-yellow-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">95%</div>
              <div className="text-blue-200 text-sm">User satisfaction</div>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Link to="/signup">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-10 py-6 text-xl rounded-2xl font-bold flex items-center group shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105">
                Start Creating Now
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <div className="flex flex-col items-center">
              <div className="text-white/80 text-lg font-medium mb-2">
                ✨ Free forever plan available
              </div>
              <div className="text-blue-200 text-sm">
                No credit card required • Setup in 30 seconds
              </div>
            </div>
          </div>
          
          {/* Feature highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm px-6 py-4 rounded-xl text-white text-sm border border-white/10 hover:bg-white/10 transition-colors">
              <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-2" />
              Instant setup
            </div>
            <div className="bg-white/5 backdrop-blur-sm px-6 py-4 rounded-xl text-white text-sm border border-white/10 hover:bg-white/10 transition-colors">
              <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-2" />
              Personal DMs
            </div>
            <div className="bg-white/5 backdrop-blur-sm px-6 py-4 rounded-xl text-white text-sm border border-white/10 hover:bg-white/10 transition-colors">
              <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-2" />
              Viral threads
            </div>
            <div className="bg-white/5 backdrop-blur-sm px-6 py-4 rounded-xl text-white text-sm border border-white/10 hover:bg-white/10 transition-colors">
              <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-2" />
              Smart replies
            </div>
          </div>

          {/* Urgency element */}
          <div className="mt-16 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-8 border border-yellow-400/30 max-w-2xl mx-auto">
            <div className="text-yellow-300 text-lg font-semibold mb-2">
              🔥 Limited Time: Early Access Pricing
            </div>
            <div className="text-white text-base">
              Lock in your lifetime discount before we raise prices next month
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
