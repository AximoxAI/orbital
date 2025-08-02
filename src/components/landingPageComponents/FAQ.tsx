import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "What makes Orbital different from other development tools?",
      answer: "Orbital uniquely combines multi-agent AI support with real-time collaboration in a single platform. Our context engineering powered by Neo4j and MCP provides unmatched code understanding and generation capabilities."
    },
    {
      question: "How quickly can my team get started with Orbital?",
      answer: "Most teams are up and running within 15 minutes. Our onboarding process guides you through connecting your repositories, configuring AI agents, and setting up collaboration workflows."
    },
    {
      question: "Is my code secure with Orbital?",
      answer: "Absolutely. We use secure sandboxes for code execution, end-to-end encryption for all communications, and follow enterprise-grade security practices. Your code never leaves your control."
    },
    {
      question: "Which AI agents does Orbital support?",
      answer: "Orbital integrates with leading AI coding assistants including @goose, @orbital_cli, @gemini_cli, and @claude_code. We're continuously adding support for new agents based on user feedback."
    },
    {
      question: "Can Orbital integrate with my existing development workflow?",
      answer: "Yes! Orbital seamlessly integrates with popular tools like GitHub, GitLab, Jira, Slack, and more. We're designed to enhance your existing workflow, not replace it."
    },
    {
      question: "What kind of support do you provide?",
      answer: "We offer 24/7 technical support, comprehensive documentation, video tutorials, and dedicated customer success managers for enterprise customers."
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about Orbital and how it works.
          </p>
        </div>
        
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-gradient-card border border-border rounded-xl px-6 py-2 shadow-elegant hover:shadow-feature transition-all duration-300"
            >
              <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;