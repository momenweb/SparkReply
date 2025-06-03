import { Star } from 'lucide-react';

const SocialProof = () => {
  const testimonials = [
    {
      quote: "SparkReply helped me 10x my Twitter engagement. My DMs actually get replies now!",
      author: "Sarah Chen",
      role: "YC Founder",
      avatar: "👩‍💼"
    },
    {
      quote: "I went from 500 to 10K followers in 3 months using SparkReply's thread generator.",
      author: "Marcus Torres",
      role: "Tech Creator",
      avatar: "👨‍💻"
    },
    {
      quote: "The personalization is insane. It writes better than I do, in my own voice.",
      author: "Alex Rivera",
      role: "Growth Hacker",
      avatar: "🚀"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="bg-blue-100 text-blue-600 rounded-full px-4 py-1 text-sm font-medium mb-4 inline-block">Testimonials</span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Loved by Creators</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of founders and creators who are already winning on X
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="mb-4 flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="text-yellow-400 fill-yellow-400 w-5 h-5" />
                ))}
              </div>
              <blockquote className="text-gray-700 mb-6 italic">
                "{testimonial.quote}"
              </blockquote>
              <div className="flex items-center">
                <div className="text-2xl mr-3">{testimonial.avatar}</div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.author}</div>
                  <div className="text-gray-500 text-sm">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Trusted by creators from</p>
          <div className="flex justify-center space-x-8">
            <div className="bg-gray-100 px-6 py-2 rounded-lg text-gray-700 shadow-sm">Y Combinator</div>
            <div className="bg-gray-100 px-6 py-2 rounded-lg text-gray-700 shadow-sm">Techstars</div>
            <div className="bg-gray-100 px-6 py-2 rounded-lg text-gray-700 shadow-sm">500 Startups</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
