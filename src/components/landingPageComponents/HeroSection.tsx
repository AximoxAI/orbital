import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";


const HeroSection = () => {
  
  const navigate = useNavigate()

  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/30 to-transparent" />
      
      <div className="max-w-7xl mx-auto text-center relative">
        <div className="inline-flex items-center animate-bounce  duration-1000 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-8 ">
          🚀 Multi-Agent SDLC Platform
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
          Transform Your
          <span className="bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent"> Development </span>
          Workflow
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
          Orbital offers a comprehensive workspace for software engineering teams, featuring intelligent AI agents, 
          project management tools, real-time task collaboration, and productivity enhancements.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
          <Button 
          variant="outline-hero"
          onClick={() => navigate("/waitlist")}
          size="lg" className="text-lg px-8 py-4">
            Start Free Trial
            <ArrowRight className="w-5 h-5" />
          </Button>
          {/* <Button variant="outline-hero" size="lg" className="text-lg px-8 py-4">
            <Play className="w-5 h-5" />
            Watch Demo
          </Button> */}
        </div>
        
        <div className="relative max-w-5xl mx-auto">
          <div className="absolute inset-0 bg-gradient-hero opacity-20 blur-3xl rounded-full" />
          <div className="relative bg-gradient-card rounded-2xl shadow-feature p-8 border border-border">
            <div className="aspect-video bg-muted rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-700 to-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-primary-foreground" />
                </div>
                <p className="text-muted-foreground">Product Demo Video</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;