import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Plus, Link as LinkIcon, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function WalletSetup() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">PC</span>
              </div>
              <span className="text-xl font-bold text-foreground">PropChain</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-10 h-10 text-primary" />
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Set Up Your Wallet
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose how you'd like to manage your digital assets on PropChain. 
            You can always change this later.
          </p>
        </div>

        {/* Wallet Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Custodial Wallet */}
          <Card className="border-border hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Create New Wallet</CardTitle>
              <p className="text-sm text-muted-foreground">Recommended for beginners</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Easy to set up and use</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">We handle security for you</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">No wallet management needed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Instant transactions</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border">
                <Link to="/wallet/create">
                  <Button className="w-full">
                    Create Wallet
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Connect External Wallet */}
          <Card className="border-border hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <LinkIcon className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Connect Existing Wallet</CardTitle>
              <p className="text-sm text-muted-foreground">For experienced users</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Use your existing wallet</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Full control of your keys</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Compatible with HashPack</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Decentralized security</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border">
                <Link to="/wallet/connect">
                  <Button variant="outline" className="w-full">
                    Connect Wallet
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Information */}
        <Card className="border-border mt-12 max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Security & Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Bank-Level Security</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• 256-bit encryption</li>
                  <li>• Multi-signature protection</li>
                  <li>• Cold storage for funds</li>
                  <li>• Regular security audits</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Your Privacy</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Zero knowledge architecture</li>
                  <li>• No personal data on blockchain</li>
                  <li>• GDPR compliant</li>
                  <li>• You own your data</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="text-center mt-8">
          <p className="text-muted-foreground mb-4">
            Need help choosing? Our team is here to assist you.
          </p>
          <Link to="/support">
            <Button variant="ghost">
              Contact Support
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}