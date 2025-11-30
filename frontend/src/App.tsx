import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Statistics from './pages/Statistics';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';

import NotFound from './pages/NotFound';

function App() {
  return (
    <div className="h-screen bg-dark-bg overflow-hidden">
      <div className="h-full overflow-y-auto scrollbar-hide">
        <div>
          <Navbar />
        </div>
        <LoginModal />
        <RegisterModal />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
