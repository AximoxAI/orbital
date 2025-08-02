import HeroSection from "@/components/landingPageComponents/HeroSection";
import SocialProof from "@/components/landingPageComponents/SocialProof";
import ProblemSolution from "@/components/landingPageComponents/ProblemSolution";
import Features from "@/components/landingPageComponents/Features";
import HowItWorks from "@/components/landingPageComponents/HowItWorks";
import Testimonials from "@/components/landingPageComponents/Testimonials";
import FAQ from "@/components/landingPageComponents/FAQ";
import CTASection from "@/components/landingPageComponents/CTASection";
import Footer from "@/components/landingPageComponents/Footer";
import Navbar from "@/components/landingPageComponents/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <SocialProof />
      <ProblemSolution />
      <Features />
      <HowItWorks />
      <Testimonials />
      <FAQ />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
