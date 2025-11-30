import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const NotFound = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    const redirect = setTimeout(() => {
      navigate('/');
    }, 10000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, [navigate]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-pomodoro-red blur-3xl opacity-20 rounded-full animate-pulse"></div>
        <h1 className="relative text-9xl font-bold text-white opacity-90">404</h1>
      </div>

      <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
        Time's Up! Page Not Found
      </h2>

      <p className="text-gray-400 max-w-md mb-8">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-pomodoro-red hover:bg-red-600 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-pomodoro-red/30 transform hover:-translate-y-0.5"
        >
          Back to Home
        </button>

        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all duration-200 border border-white/10"
        >
          Go Back
        </button>
      </div>

      <p className="mt-12 text-sm text-gray-500">
        Redirecting to home in <span className="text-pomodoro-red font-bold">{countdown}</span> seconds...
      </p>
    </div>
  );
};

export default NotFound;
