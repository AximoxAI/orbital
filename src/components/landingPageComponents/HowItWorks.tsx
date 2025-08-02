import { ArrowRight } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      step: "01",
      title: "Connect Your Workspace",
      description: "Integrate Orbital with your existing development environment and repositories."
    },
    {
      step: "02", 
      title: "Configure AI Agents",
      description: "Set up intelligent agents that understand your codebase and development patterns."
    },
    {
      step: "03",
      title: "Collaborate in Real-time",
      description: "Work with your team and AI assistants in a unified, intelligent workspace."
    },
    {
      step: "04",
      title: "Ship Better Code Faster",
      description: "Leverage automated workflows, code generation, and intelligent debugging to accelerate delivery."
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get started with Orbital in minutes and transform your development workflow.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-gradient-card p-6 rounded-2xl shadow-elegant border border-border hover:shadow-feature transition-all duration-300 h-full">
                <div className="text-5xl font-bold text-primary/20 mb-4">{step.step}</div>
                <h3 className="text-xl font-bold text-foreground mb-4">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
              
              {/* Arrow connector */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <ArrowRight className="w-6 h-6 text-primary/40" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;