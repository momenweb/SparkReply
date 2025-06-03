import { Mail, MessageCircle, FileText, Edit3, Bookmark, Palette, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Features = () => {
  const features = [
    {
      title: 'DM Generator',
      description: 'Craft personalized cold DMs that actually get responses',
      icon: Mail,
      color: 'from-blue-500 to-cyan-500',
      gradient: 'bg-blue-50'
    },
    {
      title: 'Reply Generator', 
      description: 'Generate smart replies that add value to any conversation',
      icon: MessageCircle,
      color: 'from-green-500 to-emerald-500',
      gradient: 'bg-green-50'
    },
    {
      title: 'Thread Generator',
      description: 'Create viral thread ideas and complete drafts in minutes',
      icon: FileText,
      color: 'from-purple-500 to-pink-500',
      gradient: 'bg-purple-50'
    },
    {
      title: 'Thread Rewriter',
      description: 'Transform existing content into engaging Twitter threads',
      icon: Edit3,
      color: 'from-orange-500 to-red-500',
      gradient: 'bg-orange-50'
    },
    {
      title: 'Saved Content Library',
      description: 'Store and organize your best-performing content templates',
      icon: Bookmark,
      color: 'from-indigo-500 to-purple-500',
      gradient: 'bg-indigo-50'
    },
    {
      title: 'Custom Style Settings',
      description: 'Train AI on any X user\'s style to match their voice perfectly',
      icon: Palette,
      color: 'from-pink-500 to-rose-500',
      gradient: 'bg-pink-50'
    }
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-500 rounded-full blur-xl"></div>
      </div>

      <div className="container mx-auto px-6 relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-blue-100 rounded-full px-6 py-2 mb-6">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-blue-600 text-sm font-medium">Powerful Tools</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to dominate X content creation
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className={`group relative ${feature.gradient} rounded-2xl p-8 border border-gray-200 hover:border-gray-300 shadow-md hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-1`}>
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-4 text-gray-900 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {feature.description}
                </p>

                {/* Feature indicator */}
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${feature.color}`}></div>
                  <span className="text-xs text-gray-500 font-medium">AI-Powered</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-gray-200 shadow-lg">
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Ready to supercharge your X content?</h3>
            <p className="text-gray-600 mb-6">Join thousands of creators using SparkReply to grow their audience</p>
            <div className="flex justify-center space-x-4">
              <Link to="/signup">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
