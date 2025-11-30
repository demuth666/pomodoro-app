import { useTimer } from '../context/TimerContext';

export default function Timer() {
  const {
    mode,
    timeLeft,
    isRunning,
    currentTask,
    setMode,
    startTimer,
    pauseTimer,
    resetTimer,
    getDuration
  } = useTimer();

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const displayTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const totalTime = getDuration(mode);
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const circumference = 2 * Math.PI * 100;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const handleStart = () => {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  };

  return (
    <div className="bg-dark-card rounded-card p-4 sm:p-6 lg:p-8 h-full flex flex-col relative">
      {/* Mode Switcher */}
      <div className="absolute top-4 sm:top-6 left-0 right-0 flex justify-center z-10">
        <div className="bg-dark-gray rounded-full p-1 flex space-x-1">
          {(['focus', 'shortBreak', 'longBreak'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`
                px-3 py-1 rounded-full text-xs font-medium transition-colors
                ${mode === m ? 'bg-pomodoro-red text-white' : 'text-gray-400 hover:text-white'}
              `}
            >
              {m === 'focus' ? 'Focus' : m === 'shortBreak' ? 'Short Break' : 'Long Break'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center flex-1 mt-8">
        {/* Current Task Label */}
        <div className="mb-6 text-center">
          <div className="text-gray-400 text-sm mb-1 pt-2">Current Focus</div>
          <div className="text-xl font-semibold text-white">{currentTask?.task || 'No active task'}</div>
        </div>

        {/* Circular Timer */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 mb-4 sm:mb-6">
          <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 256 256">
            <circle
              cx="128"
              cy="128"
              r="100"
              stroke="#2a2a2a"
              strokeWidth="6"
              fill="none"
            />
            {Array.from({ length: 60 }).map((_, i) => {
              const angle = (i * 6 - 90) * (Math.PI / 180);
              const x1 = 128 + 100 * Math.cos(angle);
              const y1 = 128 + 100 * Math.sin(angle);
              const x2 = 128 + (i % 5 === 0 ? 92 : 96) * Math.cos(angle);
              const y2 = 128 + (i % 5 === 0 ? 92 : 96) * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={i % 5 === 0 ? "#3a3a3a" : "#2a2a2a"}
                  strokeWidth={i % 5 === 0 ? 2 : 1}
                />
              );
            })}
            <circle
              cx="128"
              cy="128"
              r="100"
              stroke="#f87171"
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl sm:text-5xl font-bold mb-2">{displayTime}</div>
          </div>
        </div>

        <button
          onClick={handleStart}
          className="bg-pomodoro-red hover:bg-red-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base mb-2"
        >
          {isRunning ? 'Pause session' : 'Start session'}
        </button>
        {timeLeft < getDuration(mode) && (
          <button
            onClick={resetTimer}
            className="mt-4 flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 hover:bg-white/5 transition-all text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Reset Timer</span>
          </button>
        )}
      </div>
    </div>
  );
}
