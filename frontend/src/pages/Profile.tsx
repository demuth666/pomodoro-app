import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const mockStats = {
    level: user?.level || 1,
    xp: user?.xp || 0,
    nextLevelXp: ((user?.level || 1) * 1000),
    joinDate: 'November 2025',
  };

  const xpPercentage = (mockStats.xp / mockStats.nextLevelXp) * 100;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    } else if (user) {
      setFormData({
        username: user.username,
        email: user.email
      });
    }
  }, [isAuthenticated, navigate, user]);

  const handleSave = async () => {
    setIsLoading(true);
    setError('');
    const success = await updateProfile(formData);
    setIsLoading(false);
    if (success) {
      setIsEditing(false);
    } else {
      setError('Failed to update profile. Email might be taken.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        username: user.username,
        email: user.email
      });
    }
    setError('');
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-5xl space-y-8">
      {/* Header / User Card */}
      <div className="bg-dark-card rounded-card p-6 sm:p-8 border border-white/5 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar */}
        <div className="relative">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-pomodoro-red to-purple-600 flex items-center justify-center text-4xl shadow-lg border-4 border-dark-bg">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="absolute bottom-0 right-0 bg-dark-card text-xs font-bold px-2 py-1 rounded-full border border-white/10 shadow-sm">
            Lvl {mockStats.level}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left w-full">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">{user?.username}</h1>
          <p className="text-gray-400 text-sm mb-4">
            Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown'}
          </p>

          {/* XP Progress */}
          <div className="max-w-md">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>XP Progress</span>
              <span>{mockStats.xp} / {mockStats.nextLevelXp} XP</span>
            </div>
            <div className="h-2 bg-dark-gray rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pomodoro-red to-orange-500 transition-all duration-500"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {mockStats.nextLevelXp - mockStats.xp} XP to reach Level {mockStats.level + 1}
            </p>
          </div>
        </div>
      </div>

      {/* Account Details */}
      <section className="bg-dark-card rounded-card p-6 sm:p-8 border border-white/5">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-white">Account Details</h2>
           {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-sm font-medium transition-colors"
          >
            Edit Profile
          </button>
        )}
          {isEditing && (
            <div className="flex space-x-2">
              <button
                onClick={handleCancel}
                className="px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 text-sm bg-pomodoro-red text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
            <input
              type="text"
              value={isEditing ? formData.username : (user?.username || '')}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              readOnly={!isEditing}
              className={`w-full bg-dark-gray border rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none ${
                isEditing
                  ? 'border-gray-600 focus:border-pomodoro-red'
                  : 'border-gray-700 cursor-not-allowed'
              }`}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Email Address</label>
            <input
              type="email"
              value={isEditing ? formData.email : (user?.email || '')}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              readOnly={!isEditing}
              className={`w-full bg-dark-gray border rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none ${
                isEditing
                  ? 'border-gray-600 focus:border-pomodoro-red'
                  : 'border-gray-700 cursor-not-allowed'
              }`}
            />
          </div>

          {!isEditing && (
            <div className="pt-4 border-t border-white/5">
              <button
                onClick={() => {
                logout();
              }}
              className="w-full py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors">
                Log Out
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
