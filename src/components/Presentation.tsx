import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Import slide components
import TitleSlide from './slides/TitleSlide';
import BusinessProblemSlide from './slides/BusinessProblemSlide';
import RLSolutionSlide from './slides/RLSolutionSlide';
import RLSimulationSlide from './slides/RLSimulationSlide';
import ServerAnimationSlide from './slides/ServerAnimationSlide';
import ImplementationEnvSlide from './slides/ImplementationEnvSlide';
import ImplementationTrainingSlide from './slides/ImplementationTrainingSlide';
import ImplementationArchSlide from './slides/ImplementationArchSlide';
import ExperimentalSetupSlide from './slides/ExperimentalSetupSlide';
import ResultsMetricsSlide from './slides/ResultsMetricsSlide';
import ResultsImprovementsSlide from './slides/ResultsImprovementsSlide';
import ResultsTemporalSlide from './slides/ResultsTemporalSlide';
import AnimatedResultsSlide from './slides/AnimatedResultsSlide';
import AnimatedTemporalSlide from './slides/AnimatedTemporalSlide';
import AcademicValidationSlide from './slides/AcademicValidationSlide';
import PracticalApplicationSlide from './slides/PracticalApplicationSlide';
import ConclusionSlide from './slides/ConclusionSlide';
import ThankYouSlide from './slides/ThankYouSlide';
import StateSpaceSlide from './slides/StateSpaceSlide';
import ActionRewardSlide from './slides/ActionRewardSlide';
import PPOAlgorithmSlide from './slides/PPOAlgorithmSlide';

const slides = [
  { id: 1, component: TitleSlide, title: 'Title' },
  { id: 2, component: BusinessProblemSlide, title: 'Business Problem' },
  { id: 3, component: RLSolutionSlide, title: 'RL Solution' },
  { id: 4, component: StateSpaceSlide, title: 'State Space (18D)' },
  { id: 5, component: ActionRewardSlide, title: 'Actions & Rewards' },
  { id: 6, component: PPOAlgorithmSlide, title: 'PPO Algorithm' },
  { id: 7, component: RLSimulationSlide, title: 'Interactive RL Simulation' },
  { id: 8, component: ServerAnimationSlide, title: 'Live Demo: Scaling' },
  { id: 9, component: ImplementationEnvSlide, title: 'Implementation: Environment' },
  { id: 10, component: ImplementationTrainingSlide, title: 'Implementation: Training' },
  { id: 11, component: ImplementationArchSlide, title: 'Implementation: Architecture' },
  { id: 12, component: ExperimentalSetupSlide, title: 'Experimental Setup' },
  { id: 13, component: ResultsMetricsSlide, title: 'Results: Metrics' },
  { id: 14, component: AnimatedResultsSlide, title: 'Results: Animated Chart' },
  { id: 15, component: AnimatedTemporalSlide, title: 'Results: Temporal Analysis' },
  { id: 16, component: AcademicValidationSlide, title: 'Academic Validation' },
  { id: 17, component: PracticalApplicationSlide, title: 'Practical Application' },
  { id: 18, component: ConclusionSlide, title: 'Conclusion' },
  { id: 19, component: ThankYouSlide, title: 'Thank You' },
];

export default function Presentation() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  const nextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setDirection(1);
      setCurrentSlide(currentSlide + 1);
    }
  }, [currentSlide]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide(currentSlide - 1);
    }
  }, [currentSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  const CurrentSlideComponent = slides[currentSlide].component;

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden">
      {/* Progress bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-muted z-50">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Slide counter */}
      <div className="absolute top-4 right-4 text-sm text-muted-foreground z-50 font-mono">
        {currentSlide + 1} / {slides.length}
      </div>

      {/* Slides */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="absolute inset-0"
        >
          <CurrentSlideComponent />
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="rounded-full"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="rounded-full"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Slide indicator dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 -translate-y-16 flex gap-2 z-40">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentSlide ? 1 : -1);
              setCurrentSlide(index);
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-primary w-8'
                : 'bg-muted hover:bg-muted-foreground'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
