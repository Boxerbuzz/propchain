import {
  Building,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const navigationLinks = [
    { name: "Browse Properties", href: "/browse" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "Wallet", href: "/wallet/dashboard" },
  ];

  const companyLinks = [
    { name: "About Us", href: "/about" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "Security", href: "/security" },
    { name: "Careers", href: "/careers" },
  ];

  const legalLinks = [
    { name: "Terms of Service", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Risk Disclosure", href: "/risk-disclosure" },
    { name: "Regulatory", href: "/regulatory" },
  ];

  const socialLinks = [
    { name: "Twitter", href: "https://twitter.com/propchain", icon: Twitter },
    {
      name: "LinkedIn",
      href: "https://linkedin.com/company/propchain",
      icon: Linkedin,
    },
    {
      name: "Facebook",
      href: "https://facebook.com/propchain",
      icon: Facebook,
    },
    {
      name: "Instagram",
      href: "https://instagram.com/propchain",
      icon: Instagram,
    },
  ];

  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link
              to="/"
              className="flex items-center gap-3 mb-6 w-fit hover:scale-105 transition-transform duration-200 group"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-hover rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-200">
                <span className="text-primary-foreground font-bold text-lg">
                  PC
                </span>
              </div>
              <span className="text-xl font-bold text-foreground tracking-tight">
                PropChain
              </span>
            </Link>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              Invest in premium Nigerian real estate through blockchain
              tokenization. Start building your property portfolio with as
              little as ₦10,000.
            </p>

            <div className="flex items-center gap-4">
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

          {/* Platform Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Platform</h3>
            <ul className="space-y-3">
              {navigationLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-all duration-200 inline-flex items-center gap-1 group relative"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {link.name}
                    </span>
                    <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
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
                    className="text-muted-foreground hover:text-primary transition-all duration-200 inline-flex items-center gap-1 group relative"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {link.name}
                    </span>
                    <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">
              Legal & Support
            </h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-all duration-200 inline-flex items-center gap-1 group relative"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {link.name}
                    </span>
                    <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Link
                to="/support"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 hover:shadow-md hover:scale-105 transition-all duration-200 text-sm font-medium group"
              >
                <span>Support Center</span>
                <Building className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
              </Link>
            </div>
          </div>
        </div>
        {/* Regulatory Disclaimer */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="bg-muted/30 rounded-lg p-6 space-y-3">
            <h4 className="font-semibold text-sm">Regulatory Disclosure</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              PropChain Technologies Limited ("PropChain") is registered and
              regulated by the Securities and Exchange Commission, Nigeria as a
              digital investment platform. PropChain does not provide investment
              advice and individual investors should make their own decisions or
              seek independent financial advice. The value of investments can go
              up as well as down and you may receive back less than your
              original investment. Tokenized real estate securities are
              facilitated by PropChain using Hedera distributed ledger
              technology. PropChain does not make any personal recommendations
              to buy, sell, or otherwise deal in investments. Investors make
              their own investment decisions. The services and securities
              provided by PropChain may not be suitable for all customers and,
              if you have any doubts, you should seek advice from an independent
              financial advisor.
            </p>
            <p className="text-xs text-muted-foreground">
              All property tokenizations are subject to regulatory approval and
              compliance with applicable securities laws. Investment
              opportunities are available only to verified users who have
              completed KYC requirements.
            </p>
          </div>
          <div className="text-sm text-muted-foreground text-center">
            © {currentYear} PropChain. All rights reserved. | Built on Hedera
            Hashgraph
          </div>
        </div>
      </div>
    </footer>
  );
}
