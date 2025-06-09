import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-3 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-4">
      <div className="bg-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-full px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <img src="/favicon.svg" alt="SparkReply Logo" className="w-6 h-6" />
            </div>
            <span className="text-white font-semibold text-base">SparkReply</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => scrollToSection('home')} 
              className="text-gray-300 hover:text-white transition-colors text-sm"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('features')} 
              className="text-gray-300 hover:text-white transition-colors text-sm"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('pricing')} 
              className="text-gray-300 hover:text-white transition-colors text-sm"
            >
              Pricing
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')} 
              className="text-gray-300 hover:text-white transition-colors text-sm"
            >
              How It Works
            </button>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <Link to="/dashboard">
                <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4 py-1.5 text-sm flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-full px-4 py-1.5 text-sm">
                    Log in
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4 py-1.5 text-sm">
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-700/50">
            <div className="flex flex-col space-y-3">
              <button 
                onClick={() => scrollToSection('home')} 
                className="text-gray-300 hover:text-white transition-colors py-2 text-left"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('features')} 
                className="text-gray-300 hover:text-white transition-colors py-2 text-left"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('pricing')} 
                className="text-gray-300 hover:text-white transition-colors py-2 text-left"
              >
                Pricing
              </button>
              <button 
                onClick={() => scrollToSection('how-it-works')} 
                className="text-gray-300 hover:text-white transition-colors py-2 text-left"
              >
                How It Works
              </button>
              <div className="flex flex-col space-y-2 pt-3 border-t border-gray-700/50">
                {user ? (
                  <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="w-full text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-full">
                        Log in
                      </Button>
                    </Link>
                    <Link to="/signup" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-full">
                        Sign up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
