import { Layout } from './components/layout/Layout';
import { ProfileWizard } from './components/profile/ProfileWizard';
import { OnboardingHero } from './components/profile/OnboardingHero';
import { DestinationInput } from './components/destination/DestinationInput';
import { DashboardGrid } from './components/dashboard/DashboardGrid';
import { ItineraryBuilder } from './components/itinerary/ItineraryBuilder';
import { useAppStore } from './store/useAppStore';
import { ToastProvider } from './hooks/useToast';
import { motion, AnimatePresence } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

function App() {
  const { activeStep, hasStarted } = useAppStore();

  return (
    <ToastProvider>
      <Layout>
        <AnimatePresence mode="wait">
          {!hasStarted ? (
            <motion.div
              key="onboarding"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="w-full h-full"
            >
              <OnboardingHero />
            </motion.div>
          ) : (
            <motion.div
              key={activeStep}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="w-full h-full"
            >
              {activeStep === 'profile' && <ProfileWizard />}
              {activeStep === 'destination' && <DestinationInput />}
              {activeStep === 'dashboard' && <DashboardGrid />}
              {activeStep === 'itinerary' && <ItineraryBuilder />}
            </motion.div>
          )}
        </AnimatePresence>
      </Layout>
    </ToastProvider>
  );
}

export default App;
