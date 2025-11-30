import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';
import Input from './Input';

const RegisterModal = () => {
  const { showRegisterModal, closeRegisterModal, openLoginModal, login } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!showRegisterModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('All fields are required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.register(username, email, password);
      if (response.success === true) {
          localStorage.setItem('token', response.data.token);
          login()
          closeRegisterModal();
      } else {
          closeRegisterModal();
          openLoginModal();
      }

    } catch (error: any) {
      console.error('Registration failed:', error);
      const msg = error.response?.data?.message || 'Registration failed. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={closeRegisterModal}>
      <div
        className="w-full max-w-md bg-dark-card rounded-card shadow-2xl border border-white/10 relative overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background decoration */}
        <div className="absolute top-[-20%] left-[-20%] w-64 h-64 bg-pomodoro-red rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-64 h-64 bg-pomodoro-pink rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>

        <div className="p-8 relative z-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-gray-400 text-sm">Join us to track your productivity</p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="username"
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              placeholder="Enter your username"
              required
              autoFocus
            />

            <Input
              id="email"
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              placeholder="Enter your email"
              required
            />

            <Input
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              placeholder="Create a password"
              required
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-pomodoro-red hover:bg-red-600 text-white font-bold rounded-lg shadow-lg hover:shadow-pomodoro-red/30 transform hover:-translate-y-0.5 transition-all duration-200 text-sm disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-xs">
              Already have an account?{' '}
              <button
                onClick={() => {
                    closeRegisterModal();
                    openLoginModal();
                }}
                className="text-pomodoro-red hover:text-pomodoro-pink font-medium transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
