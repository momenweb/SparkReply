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
      <section id="home">
        <Hero />
      </section>
      <section id="how-it-works">
        <HowItWorks />
      </section>
      <section id="benefits">
        <Benefits />
      </section>
      <section id="features">
        <Features />
      </section>
      <section id="comparison">
        <Comparison />
      </section>
      <section id="pricing">
        <Pricing />
      </section>
      <section id="social-proof">
        <SocialProof />
      </section>
      <section id="cta">
        <FinalCTA />
      </section>
      <Footer />
    </div>
  );
};

export default Index;
