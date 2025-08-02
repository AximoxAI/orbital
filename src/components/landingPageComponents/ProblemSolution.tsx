import { AlertTriangle, CheckCircle } from "lucide-react";

const ProblemSolution = () => {
  const problems = [
    "Fragmented development tools and workflows",
    "Poor communication between team members",
    "Lack of intelligent code assistance",
    "Time-consuming manual tasks and debugging"
  ];

  const solutions = [
    "Unified workspace with integrated AI agents",
    "Real-time collaboration and task management",
    "Context-aware code generation and review",
    "Automated workflows and intelligent debugging"
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Stop Fighting Your Tools
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Traditional development workflows are broken. Here's how Orbital fixes them.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Problems */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 bg-destructive/10 text-destructive rounded-full mb-6">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Current Pain Points
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-6">
                Development Teams Struggle With...
              </h3>
            </div>
            
            <div className="space-y-4">
              {problems.map((problem, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                  <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">{problem}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Solutions */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full mb-6">
                <CheckCircle className="w-4 h-4 mr-2" />
                Orbital Solutions
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-6">
                How Orbital Transforms Development
              </h3>
            </div>
            
            <div className="space-y-4">
              {solutions.map((solution, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">{solution}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;