import { Building2 } from "lucide-react";

const CoverSlide = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-12 text-center bg-gradient-to-br from-primary/10 via-background to-primary/5">
      <div className="mb-8">
        <Building2 className="h-24 w-24 text-primary mx-auto mb-6" />
      </div>
      
      <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
        HederaSuite
      </h1>
      
      <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl">
        Democratizing Real Estate Investment Through Blockchain Technology
      </p>
      
      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
        <p>Tokenizing the Future of Property Ownership</p>
        <p className="text-xs">Powered by Hedera Hashgraph</p>
      </div>
    </div>
  );
};

export default CoverSlide;
