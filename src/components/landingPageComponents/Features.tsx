import { Brain, Users, MessageSquare, Code } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: "Context Engineering",
      description: "Context Engineering and Pruning by Neo4j powered Knowledge Graph and MCP",
      color: "text-orange-500"
    },
    {
      icon: Users,
      title: "Multi-Agent Support", 
      description: "Integrate with @goose, @orbital_cli, @gemini_cli, @claude_code AI agents",
      color: "text-blue-500"
    },
    {
      icon: MessageSquare,
      title: "Real-time Task Chat",
      description: "Live collaboration with AI assistants and team members",
      color: "text-green-500"
    },
    {
      icon: Code,
      title: "Code Generation",
      description: "AI-assisted code writing, refactoring, and debugging in secure sandboxes",
      color: "text-purple-500"
    }
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-accent text-accent-foreground rounded-full mb-6">
            🚀 Key Features
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Everything You Need to Ship Faster
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Orbital combines intelligent AI agents with powerful collaboration tools to supercharge your development workflow.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group bg-gradient-card p-8 rounded-2xl shadow-elegant hover:shadow-feature transition-all duration-300 border border-border hover:border-primary/20"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-xl bg-background shadow-elegant group-hover:animate-glow`}>
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;