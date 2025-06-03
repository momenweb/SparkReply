import { ArrowRight, User, Brain, Sparkles, Copy, CheckCircle } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      title: 'Input a Twitter handle or topic',
      description: 'Simply paste any X handle or describe what you want to create',
      icon: User,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      number: '02', 
      title: 'AI analyzes bio + posts via X API',
      description: 'Our AI studies their writing style, interests, and recent activity',
      icon: Brain,
      color: 'from-purple-500 to-pink-500'
    },
    {
      number: '03',
      title: 'Generates personalized content',
      description: 'Get custom DMs, replies, and threads that match your voice',
      icon: Sparkles,
      color: 'from-green-500 to-emerald-500'
    },
    {
      number: '04',
      title: 'Copy, edit, and post',
      description: 'Review, customize, and share your perfectly crafted content',
      icon: Copy,
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="bg-blue-100 text-blue-600 rounded-full px-4 py-1 text-sm font-medium mb-4 inline-block">How It Works</span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">From zero to viral in four steps</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our AI-powered platform makes creating engaging content easier than ever
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto">
          {/* Steps Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={index} className="relative group">
                  <div className="bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-full transform group-hover:-translate-y-1">
                    {/* Step number badge */}
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-bold text-gray-900 shadow-md z-20 border border-gray-200">
                      {step.number}
                    </div>
                    
                    {/* Icon */}
                    <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center mb-6 mx-auto relative z-10 -mt-8`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>

                    {/* Content */}
                    <div className="p-6 pt-0 text-center">
                      <h3 className="text-lg font-semibold mb-3 text-gray-900">{step.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                    </div>
                  </div>

                  {/* Arrow connector */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 z-30">
                      <ArrowRight className="text-blue-500 w-8 h-8" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Illustration section */}
          <div className="mt-20 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 shadow-lg overflow-hidden relative">
            <div className="absolute opacity-10 right-0 top-0 w-64 h-64 bg-blue-500 rounded-full -mr-20 -mt-20"></div>
            <div className="absolute opacity-10 left-0 bottom-0 w-64 h-64 bg-purple-500 rounded-full -ml-20 -mb-20"></div>
            
            <div className="grid md:grid-cols-3 gap-8 items-center relative z-10">
              <div className="text-center">
                <div className="bg-white rounded-lg p-5 mb-4 shadow-md">
                  <div className="text-blue-600 text-sm font-medium mb-2">Input</div>
                  <div className="bg-gray-100 rounded p-3 text-sm text-gray-700 font-mono">@elonmusk</div>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <p className="text-sm text-gray-700">Simple profile entry</p>
                </div>
              </div>

              <div className="text-center">
                <div className="bg-white rounded-lg p-5 mb-4 shadow-md">
                  <div className="text-purple-600 text-sm font-medium mb-2">AI Processing</div>
                  <div className="flex justify-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <p className="text-sm text-gray-700">Advanced AI analysis</p>
                </div>
              </div>

              <div className="text-center">
                <div className="bg-white rounded-lg p-5 mb-4 shadow-md">
                  <div className="text-green-600 text-sm font-medium mb-2">Generated Content</div>
                  <div className="bg-gray-100 rounded p-3 text-sm text-gray-700">
                    "Hey Elon! Your Mars vision aligns perfectly with our mission..."
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <p className="text-sm text-gray-700">Ready to send</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
