import { useEffect, useState } from 'react';
import { useSettings } from '../context/SettingsContext';

export default function Settings() {
  const { settings, updateSettings, isLoading } = useSettings();

  const [formData, setFormData] = useState(settings)

  useEffect(() => {
    setFormData(settings)
  }, [settings])

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Konversi string ke integer karena input type="number" balikan value-nya string
    const intValue = parseInt(value) || 0;

    setFormData(prev => ({
      ...prev,
      [name]: intValue
    }));
  };

  // 4. HANDLE BLUR / SAVE (Baru kirim ke Context/API saat selesai mengetik)
  const handleBlur = () => {
    // Panggil fungsi update global di sini
    updateSettings(formData);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
      <p className="text-gray-400 text-sm mb-8">Customize your focus experience</p>

      <div className="bg-dark-card rounded-card p-6 border border-white/5">
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-pomodoro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Timer Configuration
        </h2>

        <div className="space-y-6">
          {/* Pomodoro Duration */}
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-300">Pomodoro Duration</label>
              <p className="text-xs text-gray-500 mt-1">Length of a focus session in minutes</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                name="pomodoro_duration"
                value={formData.pomodoro_duration}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                className="w-20 bg-dark-gray border border-gray-700 rounded-lg px-3 py-2 text-white text-center focus:outline-none focus:border-pomodoro-red transition-colors"
                min="1"
              />
              <span className="text-sm text-gray-400">min</span>
            </div>
          </div>

          <div className="h-px bg-white/5" />

          {/* Short Break Duration */}
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-300">Short Break Duration</label>
              <p className="text-xs text-gray-500 mt-1">Length of a short break in minutes</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                name="short_break_duration"
                value={formData.short_break_duration}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                className="w-20 bg-dark-gray border border-gray-700 rounded-lg px-3 py-2 text-white text-center focus:outline-none focus:border-pomodoro-red transition-colors"
                min="1"
                max="30"
              />
              <span className="text-sm text-gray-400">min</span>
            </div>
          </div>

          <div className="h-px bg-white/5" />

          {/* Long Break Duration */}
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-300">Long Break Duration</label>
              <p className="text-xs text-gray-500 mt-1">Length of a long break in minutes</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                name="long_break_duration"
                value={formData.long_break_duration}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                className="w-20 bg-dark-gray border border-gray-700 rounded-lg px-3 py-2 text-white text-center focus:outline-none focus:border-pomodoro-red transition-colors"
                min="1"
                max="60"
              />
              <span className="text-sm text-gray-400">min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
