import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { Dishes } from '@/pages/Dishes';
import { Combos } from '@/pages/Combos';
import { Tags } from '@/pages/Tags';
import { Inventory } from '@/pages/Inventory';
import { Activities } from '@/pages/Activities';
import { Reviews } from '@/pages/Reviews';
import { Preview } from '@/pages/Preview';
import { useUIStore } from '@/store/uiStore';

function App() {
  const { currentPage } = useUIStore();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'dishes':
        return <Dishes />;
      case 'combos':
        return <Combos />;
      case 'tags':
        return <Tags />;
      case 'inventory':
        return <Inventory />;
      case 'activities':
        return <Activities />;
      case 'reviews':
        return <Reviews />;
      case 'preview':
        return <Preview />;
      default:
        return <Dashboard />;
    }
  };

  return <Layout>{renderPage()}</Layout>;
}

export default App;
