import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero opacity-5" />
      
      <div className="max-w-4xl mx-auto text-center relative">
        <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full mb-8 animate-float">
          <Sparkles className="w-4 h-4 mr-2" />
          Ready to transform your workflow?
        </div>
        
        <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
          Start Building with
          <span className="bg-gradient-hero bg-clip-text text-transparent"> Orbital </span>
          Today
        </h2>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
          Join 500+ development teams who have already transformed their workflow. 
          Start your free trial today and experience the future of software development.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Button variant="outline-hero" size="lg" className="text-lg px-8 py-4 ">
            Start Free Trial
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Button variant="outline-hero" size="lg" className="text-lg px-8 py-4">
            Book a Demo
          </Button>
        </div>
        
        <p className="text-muted-foreground mt-6">
          No credit card required • 14-day free trial • Setup in 5 minutes
        </p>
      </div>
    </section>
  );
};

export default CTASection;