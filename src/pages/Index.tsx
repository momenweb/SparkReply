import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import Benefits from '@/components/Benefits';
import Features from '@/components/Features';
import Comparison from '@/components/Comparison';
import Pricing from '@/components/Pricing';
import SocialProof from '@/components/SocialProof';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <HowItWorks />
      <Benefits />
      <Features />
      <Comparison />
      <Pricing />
      <SocialProof />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default Index;
