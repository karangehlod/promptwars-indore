import { motion } from 'framer-motion';
import { Compass, Calendar, MapPin, Sparkles } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const steps = [
  {
    icon: <Compass className="w-8 h-8 text-accent" />,
    title: '1. Tell Us About You',
    description: 'Share your interests, travel style, and budget preferences.'
  },
  {
    icon: <MapPin className="w-8 h-8 text-accent" />,
    title: '2. Discover Gems',
    description: 'Explore AI-curated recommendations, heritage sites, and authentic experiences.'
  },
  {
    icon: <Calendar className="w-8 h-8 text-accent" />,
    title: '3. Build Your Trip',
    description: 'Select your favorites and let us magically generate a day-by-day itinerary.'
  }
];

export function OnboardingHero() {
  const { setHasStarted } = useAppStore();

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 flex flex-col items-center text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mb-8"
      >
        <Sparkles className="w-10 h-10 text-accent" />
      </motion.div>
      
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-4xl md:text-5xl font-bold mb-6 text-text-primary tracking-tight"
      >
        Welcome to TravelYarro
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-lg md:text-xl text-text-secondary max-w-2xl mb-16"
      >
        Your personal AI-powered travel curator. We help you discover hidden gems, authentic experiences, and rich cultural heritage—all perfectly tailored to your budget.
      </motion.p>

      <div className="grid md:grid-cols-3 gap-8 w-full mb-16">
        {steps.map((step, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + idx * 0.1 }}
            className="flex flex-col items-center bg-surface-elevated p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="mb-4 bg-surface p-4 rounded-full border border-border shadow-sm">
              {step.icon}
            </div>
            <h3 className="font-bold text-lg mb-2 text-text-primary">{step.title}</h3>
            <p className="text-sm text-text-secondary">{step.description}</p>
          </motion.div>
        ))}
      </div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        onClick={() => setHasStarted(true)}
        className="bg-accent hover:bg-accent-hover text-white px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 active:translate-y-0"
      >
        Let's Start Planning
      </motion.button>
    </div>
  );
}
