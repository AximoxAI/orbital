
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Code, Computer } from "lucide-react";

const SoftwareEngineering = () => {
  const aiAgents = [
    {
      id: 1,
      name: "CodeArchitect AI",
      description: "Designs and plans software architecture with best practices and scalable solutions.",
      capabilities: ["System Design", "Architecture Planning", "Code Review", "Performance Optimization"],
      status: "Active",
      icon: <Code className="w-8 h-8" />,
      color: "bg-blue-500"
    },
    {
      id: 2,
      name: "BugHunter AI",
      description: "Automatically detects, analyzes, and suggests fixes for bugs and security vulnerabilities.",
      capabilities: ["Bug Detection", "Security Analysis", "Code Scanning", "Automated Testing"],
      status: "Active",
      icon: <Bot className="w-8 h-8" />,
      color: "bg-red-500"
    },
    {
      id: 3,
      name: "DevOps Assistant",
      description: "Manages deployment pipelines, infrastructure, and continuous integration processes.",
      capabilities: ["CI/CD Management", "Infrastructure Setup", "Monitoring", "Automation"],
      status: "Active",
      icon: <Computer className="w-8 h-8" />,
      color: "bg-green-500"
    },
    {
      id: 4,
      name: "Code Mentor AI",
      description: "Provides personalized code reviews, suggestions, and learning recommendations.",
      capabilities: ["Code Review", "Best Practices", "Learning Paths", "Skill Assessment"],
      status: "Training",
      icon: <Code className="w-8 h-8" />,
      color: "bg-purple-500"
    },
    {
      id: 5,
      name: "API Generator",
      description: "Automatically generates RESTful APIs, documentation, and integration code.",
      capabilities: ["API Design", "Documentation", "Code Generation", "Testing"],
      status: "Active",
      icon: <Bot className="w-8 h-8" />,
      color: "bg-orange-500"
    },
    {
      id: 6,
      name: "Data Flow Analyzer",
      description: "Analyzes data flows, optimizes database queries, and ensures data integrity.",
      capabilities: ["Data Analysis", "Query Optimization", "Performance Tuning", "Schema Design"],
      status: "Active",
      icon: <Computer className="w-8 h-8" />,
      color: "bg-teal-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Software Engineering AI Agents
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Harness the power of AI to streamline your development workflow with intelligent agents 
            designed to assist in every aspect of software engineering.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">6</div>
              <div className="text-slate-600">Active Agents</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
              <div className="text-slate-600">Availability</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">99.9%</div>
              <div className="text-slate-600">Uptime</div>
            </CardContent>
          </Card>
        </div>

        {/* AI Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aiAgents.map((agent) => (
            <Card key={agent.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-full ${agent.color} text-white`}>
                    {agent.icon}
                  </div>
                  <Badge 
                    variant={agent.status === "Active" ? "default" : "secondary"}
                    className={agent.status === "Active" ? "bg-green-500" : ""}
                  >
                    {agent.status}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{agent.name}</CardTitle>
                <CardDescription>{agent.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h4 className="font-semibold text-sm text-slate-700 mb-2">Capabilities:</h4>
                  <div className="flex flex-wrap gap-2">
                    {agent.capabilities.map((capability, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {capability}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    Deploy
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-2xl font-bold mb-4">Ready to Supercharge Your Development?</h2>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Get started with our AI agents today and experience the future of software engineering.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary">
                  Start Free Trial
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
                  Book Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SoftwareEngineering;
