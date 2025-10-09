import { Building, Mail, Phone, MapPin, Twitter, Linkedin, Facebook, Instagram } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const navigationLinks = [
    { name: "Browse Properties", href: "/browse" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "Wallet", href: "/wallet/dashboard" }
  ];

  const companyLinks = [
    { name: "About Us", href: "/about" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "Security", href: "/security" },
    { name: "Careers", href: "/careers" }
  ];

  const legalLinks = [
    { name: "Terms of Service", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Risk Disclosure", href: "/risk-disclosure" },
    { name: "Regulatory", href: "/regulatory" }
  ];

  const socialLinks = [
    { name: "Twitter", href: "https://twitter.com/propchain", icon: Twitter },
    { name: "LinkedIn", href: "https://linkedin.com/company/propchain", icon: Linkedin },
    { name: "Facebook", href: "https://facebook.com/propchain", icon: Facebook },
    { name: "Instagram", href: "https://instagram.com/propchain", icon: Instagram }
  ];

  return (
    <footer className="bg-gradient-to-b from-background to-background-muted border-t border-border relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.05),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--accent)/0.05),transparent_50%)]"></div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                <Building className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-2xl text-foreground">PropChain</span>
            </div>
            
            <p className="text-muted-foreground mb-6 leading-relaxed max-w-sm">
              Democratizing real estate investment through blockchain technology. 
              Own fractions of premium properties and earn passive income.
            </p>
            
            <div className="space-y-3 mb-6">
              <a href="mailto:hello@propchain.ng" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <span>hello@propchain.ng</span>
              </a>
              <a href="tel:+2348000000000" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <span>+234 800 PROPCHAIN</span>
              </a>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <span>Lagos, Nigeria</span>
              </div>
            </div>
          </div>
          
          {/* Platform Links */}
          <div>
            <h3 className="font-bold text-foreground mb-5 text-sm uppercase tracking-wider">Platform</h3>
            <ul className="space-y-3">
              {navigationLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Company Links */}
          <div>
            <h3 className="font-bold text-foreground mb-5 text-sm uppercase tracking-wider">Company</h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Legal & Support */}
          <div>
            <h3 className="font-bold text-foreground mb-5 text-sm uppercase tracking-wider">Legal</h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Link 
                to="/support"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary/10 to-accent/10 text-primary rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 text-sm font-semibold border border-primary/20"
              >
                Support Center
              </Link>
            </div>
          </div>
        </div>
        
        {/* Divider */}
        <div className="border-t border-border/50 mb-8"></div>
        
        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Copyright */}
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <span>© {currentYear} PropChain. All rights reserved.</span>
            <span className="hidden md:inline">•</span>
            <span className="flex items-center gap-1.5">
              Built on <span className="font-semibold text-primary">Hedera Hashgraph</span>
            </span>
          </div>
          
          {/* Social Links */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground mr-2">Connect:</span>
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-muted to-muted/50 hover:from-primary/10 hover:to-accent/10 text-muted-foreground hover:text-primary transition-all duration-300 group flex items-center justify-center border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 hover-scale"
                aria-label={social.name}
              >
                <social.icon className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              </a>
            ))}
          </div>
        </div>
        
        {/* Additional Info */}
        <div className="mt-8 pt-8 border-t border-border/50">
          <div className="text-center">
            <p className="text-xs text-muted-foreground leading-relaxed max-w-4xl mx-auto bg-muted/30 rounded-lg p-4">
              <span className="font-semibold text-foreground">Disclaimer:</span> PropChain is a registered financial technology company. All investments carry risk, including potential loss of capital. 
              Past performance does not guarantee future results. Please read our risk disclosure and terms of service carefully before investing.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}