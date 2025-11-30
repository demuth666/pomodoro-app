import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { UserSettings } from '../types';
import { useAuth } from './AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { settingsService } from '../services/settings.service';

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  isLoading: boolean;
}

const defaultSettings: UserSettings = {
 pomodoro_duration: 25,
 short_break_duration: 5,
 long_break_duration: 15,
 auto_start_breaks: false,
 auto_start_pomodoro: false,
 alarm_sound: 'digital'
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const [guestSettings, setGuestSettings] = useLocalStorage<UserSettings>('pomodoro_settings', defaultSettings);
  const [userSettings, setUserSettings] = useState<UserSettings>(defaultSettings);

  const [isLoading] = useState(false);

  const currentSettings = isAuthenticated ? userSettings : guestSettings;
  useEffect(() => {
    if (isAuthenticated && user?.settings) {
      setUserSettings(user.settings);
    }
  }, [isAuthenticated, user]);

  const updateSettings = async (newValues: Partial<UserSettings>) => {
    const mergedSettings = { ...currentSettings, ...newValues };

    if (isAuthenticated) {
      setUserSettings(mergedSettings);

      try {
        await settingsService.update(mergedSettings);
      } catch (error) {
        console.error("Gagal save setting ke server", error);
      }
    } else {
      setGuestSettings(mergedSettings);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings: currentSettings, updateSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
