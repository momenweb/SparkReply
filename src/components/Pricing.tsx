import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const Pricing = () => {
  const plans = [
    {
      name: 'Starter',
      price: '$9',
      period: '/month',
      description: 'Perfect for getting started',
      features: [
        '100 generations per month',
        'DM Generator',
        'Reply Generator', 
        'Basic templates',
        'Email support'
      ],
      popular: false
    },
    {
      name: 'Pro',
      price: '$39',
      period: '/month',
      description: 'Best for active creators',
      features: [
        '500 generations per month',
        'All generators included',
        'Saved Content Library',
        'Thread Rewriter',
        'Priority support',
        'Custom templates'
      ],
      popular: true
    },
    {
      name: 'Business',
      price: '$79',
      period: '/month',
      description: 'For agencies and teams',
      features: [
        'Unlimited generations',
        'Custom Style Profiles',
        'Priority AI processing',
        'Team collaboration',
        'API access',
        'Dedicated support'
      ],
      popular: false
    }
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="bg-blue-100 text-blue-600 rounded-full px-4 py-1 text-sm font-medium mb-4 inline-block">Pricing</span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Simple Pricing</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your content creation needs
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div key={index} className={`relative bg-white rounded-xl p-8 shadow-lg ${plan.popular ? 'ring-2 ring-blue-500' : 'border border-gray-200'}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2 text-gray-900">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="text-green-500 mr-3 flex-shrink-0" size={16} />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link to="/signup">
                <Button className={`w-full py-3 ${plan.popular ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300'}`}>
                  Start writing smarter
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
