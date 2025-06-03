import { Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 py-16 border-t border-gray-200">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900 flex items-center">
              <Sparkles className="w-5 h-5 text-blue-500 mr-2" />
              SparkReply
            </h3>
            <p className="text-gray-600 mb-4">
              AI-powered content creation for X that actually converts.
            </p>
            <div className="text-gray-500">
              <p>Made for creators, by creators</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Product</h4>
            <ul className="space-y-2 text-gray-600">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">How it works</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Demo</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Support</h4>
            <ul className="space-y-2 text-gray-600">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">API Docs</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Company</h4>
            <ul className="space-y-2 text-gray-600">
              <li><a href="#" className="hover:text-blue-600 transition-colors">About</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy</a></li>
              <li><a href="https://x.com/sparkreply" className="hover:text-blue-600 transition-colors">X Profile</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-12 pt-8 text-center text-gray-500">
          <p>&copy; 2024 SparkReply. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
