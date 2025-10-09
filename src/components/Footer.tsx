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
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Building className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl text-foreground">PropChain</span>
            </div>
            
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Invest in premium Nigerian real estate through blockchain tokenization. 
              Start building your property portfolio with as little as ₦10,000.
            </p>
            
            <div className="space-y-3">
              <a href="mailto:hello@propchain.ng" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <span>hello@propchain.ng</span>
              </a>
              <a href="tel:+2348000000000" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <span>+234 800 PROPCHAIN</span>
              </a>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Lagos, Nigeria</span>
              </div>
            </div>
          </div>
          
          {/* Platform Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Platform</h3>
            <ul className="space-y-3">
              {navigationLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Legal & Support */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal & Support</h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Link 
                to="/support"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors duration-200 text-sm font-medium"
              >
                Support Center
              </Link>
            </div>
          </div>
        </div>
        
        {/* Divider */}
        <div className="border-t border-border mb-8"></div>
        
        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Copyright */}
          <div className="text-sm text-muted-foreground">
            © {currentYear} PropChain. All rights reserved. | Built on Hedera Hashgraph
          </div>
          
          {/* Social Links */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground mr-2">Follow us:</span>
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all duration-200 group"
                aria-label={social.name}
              >
                <social.icon className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              </a>
            ))}
          </div>
        </div>
        
        {/* Additional Info */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="text-center">
            <p className="text-xs text-muted-foreground leading-relaxed max-w-4xl mx-auto">
              PropChain is a registered financial technology company. All investments carry risk, including potential loss of capital. 
              Past performance does not guarantee future results. Please read our risk disclosure and terms of service carefully before investing.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}