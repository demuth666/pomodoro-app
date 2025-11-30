import { useState, useEffect, useRef, useCallback } from 'react';
import { useSettings } from '../context/SettingsContext';
import { type Task } from '../types';
import { sessionService } from '../services/session.service';
import { useAuth } from '../context/AuthContext';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

interface TimerProps {
  currentTask: Task | null;
  onSessionComplete?: () => void;
}

export default function Timer({ currentTask, onSessionComplete }: TimerProps) {
  const { settings } = useSettings();
  const { isAuthenticated } = useAuth();
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(settings.pomodoro_duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [focusCount, setFocusCount] = useState(0);

  // Refs to hold latest state values for access inside interval
  const modeRef = useRef(mode);
  const currentTaskRef = useRef(currentTask);
  const focusCountRef = useRef(focusCount);
  const isAuthenticatedRef = useRef(isAuthenticated);
  const startTimeRef = useRef<Date | null>(null);
  const intervalRef = useRef<number | undefined>(undefined);
  const processingRef = useRef(false);

  // Update refs when state changes
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    currentTaskRef.current = currentTask;
  }, [currentTask]);

  useEffect(() => {
    focusCountRef.current = focusCount;
  }, [focusCount]);

  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  const getDuration = useCallback((m: TimerMode) => {
    switch (m) {
      case 'focus': return settings.pomodoro_duration * 60;
      case 'shortBreak': return settings.short_break_duration * 60;
      case 'longBreak': return settings.long_break_duration * 60;
    }
  }, [settings]);

  // Reset timer when mode or duration settings change
  useEffect(() => {
    setTimeLeft(getDuration(mode));
    setIsRunning(false);
    startTimeRef.current = null;
    processingRef.current = false;
  }, [mode, getDuration]);

  const handleTimerComplete = async () => {
      if (processingRef.current) return;
      processingRef.current = true;

      const currentMode = modeRef.current;
      const duration = getDuration(currentMode);
      const now = new Date();
      const startTime = startTimeRef.current || new Date(now.getTime() - duration * 1000);

      if (isAuthenticatedRef.current) {
        try {
            await sessionService.createSession({
                task_id: currentTaskRef.current?.id,
                type: currentMode === 'focus' ? 'focus' : currentMode === 'shortBreak' ? 'short_break' : 'long_break',
                status: 'completed',
                duration: duration,
                started_at: startTime.toISOString(),
                ended_at: now.toISOString(),
            });
            if (onSessionComplete) {
                onSessionComplete();
            }
        } catch (error) {
            console.error("Failed to record session:", error);
        }
      }

      // Auto-switch logic
      if (currentMode === 'focus') {
        const newCount = focusCountRef.current + 1;
        setFocusCount(newCount);
        if (newCount % 4 === 0) {
          setMode('longBreak');
        } else {
          setMode('shortBreak');
        }
      } else {
        // Break is over, back to focus
        setMode('focus');
      }

      setIsRunning(false);
      processingRef.current = false;
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      if (!startTimeRef.current) {
          startTimeRef.current = new Date();
      }

      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const newValue = prev - 1;
          if (newValue <= 0) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            handleTimerComplete();
            return 0;
          }
          return newValue;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
      if (!isRunning) {
          startTimeRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]); // Removed timeLeft dependency to prevent re-creation

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isRunning) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isRunning]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const displayTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const totalTime = getDuration(mode);
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const circumference = 2 * Math.PI * 100;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const handleStart = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(getDuration(mode));
  };

  return (
    <div className="bg-dark-card rounded-card p-4 sm:p-6 lg:p-8 h-full flex flex-col relative">
      {/* Mode Switcher */}
      <div className="absolute top-4 sm:top-6 left-0 right-0 flex justify-center z-10">
        <div className="bg-dark-gray rounded-full p-1 flex space-x-1">
          {(['focus', 'shortBreak', 'longBreak'] as TimerMode[]).map((m) => (
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
            onClick={handleReset}
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
