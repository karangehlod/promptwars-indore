
import { Layout } from './components/layout/Layout';
import { ProfileWizard } from './components/profile/ProfileWizard';
import { DestinationInput } from './components/destination/DestinationInput';
import { DashboardGrid } from './components/dashboard/DashboardGrid';
import { ItineraryBuilder } from './components/itinerary/ItineraryBuilder';
import { useAppStore } from './store/useAppStore';

import { motion, AnimatePresence } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

function App() {
  const { activeStep } = useAppStore();

  return (
    <Layout>
      <AnimatePresence mode="wait">
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
      </AnimatePresence>
    </Layout>
  );
}

export default App;
