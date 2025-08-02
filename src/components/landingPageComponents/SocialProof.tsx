const SocialProof = () => {
  const companies = [
    "TechCorp", "DevFlow", "CodeBase", "AgileTeam", "BuildFast", "InnovateLabs"
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-muted-foreground mb-12 text-lg">
          Trusted by 500+ development teams worldwide
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center opacity-60">
          {companies.map((company, index) => (
            <div 
              key={index}
              className="flex items-center justify-center h-12 text-lg font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              {company}
            </div>
          ))}
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-primary mb-2">500+</div>
            <p className="text-muted-foreground">Active Teams</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">10M+</div>
            <p className="text-muted-foreground">Lines of Code</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
            <p className="text-muted-foreground">Uptime</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;