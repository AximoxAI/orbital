
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Code, Computer } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-500 rounded-full">
              <Bot className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 text-slate-800">
            Welcome to AI Engineering Hub
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Discover the future of software development with intelligent AI agents designed to revolutionize your workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Code className="w-8 h-8 text-blue-500 mb-2" />
              <CardTitle>Smart Coding</CardTitle>
              <CardDescription>AI-powered code generation and optimization</CardDescription>
            </CardHeader>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Bot className="w-8 h-8 text-green-500 mb-2" />
              <CardTitle>Intelligent Automation</CardTitle>
              <CardDescription>Automated testing and deployment pipelines</CardDescription>
            </CardHeader>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Computer className="w-8 h-8 text-purple-500 mb-2" />
              <CardTitle>System Architecture</CardTitle>
              <CardDescription>AI-driven architectural design and planning</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/software-engineering">
            <Button size="lg" className="w-full sm:w-auto">
              Explore AI Agents
            </Button>
          </Link>
          <Link to="/sign-in">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Log In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
