import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Download, Presentation } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CoverSlide from "./slides/CoverSlide";
import ProblemSlide from "./slides/ProblemSlide";
import SolutionSlide from "./slides/SolutionSlide";
import MarketSlide from "./slides/MarketSlide";
import ProductSlide from "./slides/ProductSlide";
import BusinessModelSlide from "./slides/BusinessModelSlide";
import TractionSlide from "./slides/TractionSlide";
import TeamSlide from "./slides/TeamSlide";
import FinancialsSlide from "./slides/FinancialsSlide";
import AskSlide from "./slides/AskSlide";

const PitchDeck = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { id: 0, title: "Cover", component: CoverSlide },
    { id: 1, title: "Problem", component: ProblemSlide },
    { id: 2, title: "Solution", component: SolutionSlide },
    { id: 3, title: "Market Opportunity", component: MarketSlide },
    { id: 4, title: "Product", component: ProductSlide },
    { id: 5, title: "Business Model", component: BusinessModelSlide },
    { id: 6, title: "Traction", component: TractionSlide },
    { id: 7, title: "Team", component: TeamSlide },
    { id: 8, title: "Financials", component: FinancialsSlide },
    { id: 9, title: "Ask", component: AskSlide },
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") nextSlide();
    if (e.key === "ArrowLeft") prevSlide();
  };

  const CurrentSlideComponent = slides[currentSlide].component;

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8"
      onKeyDown={handleKeyPress}
      tabIndex={0}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Presentation className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Pitch Deck</h1>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>

        {/* Slide Navigation Dots */}
        <div className="flex justify-center gap-2 mb-6">
          {slides.map((slide) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlide(slide.id)}
              className={`h-2 rounded-full transition-all ${
                currentSlide === slide.id
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              aria-label={`Go to ${slide.title}`}
            />
          ))}
        </div>

        {/* Main Slide Container */}
        <Card className="relative overflow-hidden shadow-2xl">
          <CardContent className="p-0">
            <div className="relative aspect-[16/9] bg-gradient-to-br from-card to-card/80">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <CurrentSlideComponent />
                </motion.div>
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Controls */}
        <div className="flex justify-between items-center mt-6">
          <Button
            variant="outline"
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            Slide {currentSlide + 1} of {slides.length} - {slides[currentSlide].title}
          </div>

          <Button
            variant="outline"
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Keyboard Shortcuts Info */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          Use arrow keys (← →) to navigate between slides
        </p>
      </div>
    </div>
  );
};

export default PitchDeck;
