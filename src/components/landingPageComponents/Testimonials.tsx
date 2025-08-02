import { Star } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Lead Developer",
      company: "TechFlow Inc",
      content: "Orbital has completely transformed how our team collaborates. The AI agents are incredibly smart and the real-time collaboration features are game-changing.",
      rating: 5
    },
    {
      name: "Marcus Rodriguez", 
      role: "Engineering Manager",
      company: "DevCore Solutions",
      content: "We've reduced our development cycle time by 40% since implementing Orbital. The intelligent code generation and debugging features are exceptional.",
      rating: 5
    },
    {
      name: "Emily Thompson",
      role: "Senior Engineer", 
      company: "BuildFast Labs",
      content: "The context-aware AI assistance in Orbital understands our codebase better than any tool we've used before. It's like having a senior developer on the team 24/7.",
      rating: 5
    }
  ];

  return (
    <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            What Developers Say
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join hundreds of development teams who have transformed their workflow with Orbital.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-gradient-card p-8 rounded-2xl shadow-elegant border border-border hover:shadow-feature transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <p className="text-foreground mb-6 leading-relaxed italic">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center mr-4">
                  <span className="text-primary-foreground font-semibold">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-muted-foreground text-sm">{testimonial.role} at {testimonial.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;