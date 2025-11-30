import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import homeIcon from '../assets/icons/home.png';
import statisticsIcon from '../assets/icons/statistic.png';
import profileIcon from '../assets/icons/profile.png';
import settingsIcon from '../assets/icons/settings.png';
import logInIcon from '../assets/icons/log-in.png';


interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: homeIcon, path: '/' },
  { id: 'statistics', label: 'Statistics', icon: statisticsIcon, path: '/statistics' },
  { id: 'profile', label: 'Profile', icon: profileIcon, path: '/profile' },
  { id: 'settings', label: 'Settings', icon: settingsIcon, path: '/settings' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, openLoginModal } = useAuth();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname === path;
  };

  const renderNavButtons = (containerClass: string, isMobile = false) => {
    const visibleNavItems = navItems.filter(item =>
      isAuthenticated ? true : item.id !== 'profile'
    );

    return (
    <div className={containerClass}>
      {visibleNavItems.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            if (item.id === 'statistics' && !isAuthenticated) {
               openLoginModal();
               if (isMobile) setIsMenuOpen(false);
               return;
            }
            navigate(item.path);
            if (isMobile) setIsMenuOpen(false);
          }}
          className={`
                flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap
                ${
                  isActive(item.path)
                    ? 'bg-pomodoro-red text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-dark-gray'
                }
                ${isMobile ? 'w-full justify-start' : ''}
              `}
        >
          <img src={item.icon} alt={item.label} className="w-5 h-5" />
          <span className="text-xs sm:text-sm font-medium">
            {item.label}
          </span>
        </button>
      ))}
      {!isAuthenticated && (
        <button
          onClick={() => {
            openLoginModal();
            if (isMobile) setIsMenuOpen(false);
          }}
          className={`
                flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap text-gray-400 hover:text-white hover:bg-dark-gray
                ${isMobile ? 'w-full justify-start' : ''}
              `}
        >
          <img src={logInIcon} alt="Login" className="w-5 h-5" />
          <span className="text-xs sm:text-sm font-medium">Login</span>
        </button>
      )}
    </div>
  );
  };

  return (
    <nav className="w-full flex items-center justify-between sm:justify-center gap-4 py-4 px-4 sm:px-6 relative">
      {/* Mobile hamburger */}
      <button
        className="sm:hidden flex items-center justify-center w-12 h-12 rounded-full bg-[rgba(26,26,26,0.65)] backdrop-blur-xl border border-white/10 shadow-lg text-white"
        onClick={() => setIsMenuOpen((prev) => !prev)}
        aria-label="Toggle navigation"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {/* Desktop Nav */}
      <div className="hidden sm:inline-flex items-center rounded-xl border border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.35)] px-3 sm:px-5 py-2 space-x-1 overflow-x-auto scrollbar-hide bg-[rgba(26,26,26,0.65)] backdrop-blur-xl">
        {renderNavButtons('flex items-center space-x-1 min-w-max')}
      </div>

      {isMenuOpen && (
        <div className="sm:hidden absolute top-full mt-3 left-1/2 -translate-x-1/2 w-full px-4 z-50">
          <div className="flex flex-col rounded-2xl border border-white/10 bg-[rgba(26,26,26,0.85)] backdrop-blur-2xl shadow-[0_20px_45px_rgba(0,0,0,0.45)] p-3 space-y-1">
            {renderNavButtons('flex flex-col space-y-1 w-full', true)}
          </div>
        </div>
      )}
    </nav>
  );
}
