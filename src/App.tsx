
import { Layout } from './components/layout/Layout';
import { ProfileWizard } from './components/profile/ProfileWizard';
import { DestinationInput } from './components/destination/DestinationInput';
import { DashboardGrid } from './components/dashboard/DashboardGrid';
import { ItineraryBuilder } from './components/itinerary/ItineraryBuilder';
import { useAppStore } from './store/useAppStore';

function App() {
  const { activeStep } = useAppStore();

  return (
    <Layout>
      {activeStep === 'profile' && <ProfileWizard />}
      {activeStep === 'destination' && <DestinationInput />}
      {activeStep === 'dashboard' && <DashboardGrid />}
      {activeStep === 'itinerary' && <ItineraryBuilder />}
    </Layout>
  );
}

export default App;
