import { Shield, Clock, MessageSquare, Network, CheckCircle } from 'lucide-react';

const Benefits = () => {
  const benefits = [
    {
      title: 'Never sound generic again',
      description: 'AI analyzes writing styles to match your unique voice and tone',
      icon: Shield,
      color: 'from-blue-500 to-purple-600'
    },
    {
      title: 'Save hours writing threads',
      description: 'Generate viral-worthy thread ideas and complete drafts in seconds',
      icon: Clock,
      color: 'from-green-500 to-blue-500'
    },
    {
      title: 'Get replies, not ignores',
      description: 'Personalized DMs that actually get responses and start conversations',
      icon: MessageSquare,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Grow your network on autopilot',
      description: 'Build meaningful connections with automated but personal outreach',
      icon: Network,
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="bg-blue-100 text-blue-600 rounded-full px-4 py-1 text-sm font-medium mb-4 inline-block">Why Choose Us</span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Why Choose SparkReply?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stop wasting time on content that doesn't convert
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <div key={index} className="group bg-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-1 border border-gray-100">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${benefit.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 group-hover:text-blue-600 transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
                
                {/* Decorative elements */}
                <div className="mt-6 flex space-x-1">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${benefit.color} opacity-60`}></div>
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${benefit.color} opacity-40`}></div>
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${benefit.color} opacity-20`}></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional visual element */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-4 bg-white rounded-full px-8 py-4 border border-gray-200 shadow-md">
            <div className="flex space-x-2">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <div key={index} className={`w-8 h-8 rounded-full bg-gradient-to-r ${benefit.color} flex items-center justify-center`}>
                    <IconComponent className="w-4 h-4 text-white" />
                  </div>
                );
              })}
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-gray-700 font-medium">All-in-one content solution</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
