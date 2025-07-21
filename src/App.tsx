import { usePlannerStore } from './store/plannerStore';
import { Analytics } from '@vercel/analytics/react';
import Header from './components/Header';
import SetupSection from './components/SetupSection';
import PlannerSection from './components/PlannerSection';
import NotificationContainer from './components/NotificationContainer';

function App() {
  const isSetupComplete = usePlannerStore((state) => state.isSetupComplete);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors">
      <div className="container mx-auto p-4 md:p-8 max-w-7xl">
        <Header />
        {!isSetupComplete ? <SetupSection /> : <PlannerSection />}
      </div>
      <NotificationContainer />
      <Analytics />
    </div>
  );
}

export default App;
