import { Check, X } from 'lucide-react';

const Comparison = () => {
  const features = [
    {
      feature: 'Personalized DMs',
      sparkReply: true,
      manual: false,
      others: 'generic'
    },
    {
      feature: 'X Bio + Post Analysis',
      sparkReply: true,
      manual: false,
      others: false
    },
    {
      feature: 'Thread Rewriter',
      sparkReply: true,
      manual: false,
      others: 'basic'
    },
    {
      feature: 'Smart Replies Generator',
      sparkReply: true,
      manual: false,
      others: false
    },
    {
      feature: 'Custom Style Profiles',
      sparkReply: true,
      manual: false,
      others: false
    }
  ];

  const renderCell = (value: boolean | string) => {
    if (value === true) {
      return <Check className="text-green-500 mx-auto" size={20} />;
    }
    if (value === false) {
      return <X className="text-red-500 mx-auto" size={20} />;
    }
    if (value === 'generic') {
      return <span className="text-amber-500 text-sm">Generic</span>;
    }
    if (value === 'basic') {
      return <span className="text-amber-500 text-sm">Basic</span>;
    }
    return value;
  };

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="bg-blue-100 text-blue-600 rounded-full px-4 py-1 text-sm font-medium mb-4 inline-block">Comparison</span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Why SparkReply Wins</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See how we compare to manual writing and other tools
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
            <div className="grid grid-cols-4 gap-4 p-6 bg-blue-50 font-semibold text-gray-700">
              <div>Feature</div>
              <div className="text-center text-blue-600">SparkReply</div>
              <div className="text-center">Manual Writing</div>
              <div className="text-center">Other Tools</div>
            </div>
            
            {features.map((row, index) => (
              <div key={index} className="grid grid-cols-4 gap-4 p-6 border-t border-gray-200">
                <div className="font-medium text-gray-800">{row.feature}</div>
                <div className="text-center">{renderCell(row.sparkReply)}</div>
                <div className="text-center">{renderCell(row.manual)}</div>
                <div className="text-center">{renderCell(row.others)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Comparison;
