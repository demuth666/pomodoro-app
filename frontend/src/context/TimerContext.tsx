import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { useSettings } from './SettingsContext';
import { useAuth } from './AuthContext';
import { sessionService } from '../services/session.service';
import { type Task } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

interface TimerContextType {
  mode: TimerMode;
  timeLeft: number;
  isRunning: boolean;
  currentTask: Task | null;
  setCurrentTask: (task: Task | null) => void;
  setMode: (mode: TimerMode) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  getDuration: (mode: TimerMode) => number;
  sessionCompleteTrigger: number;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider = ({ children }: { children: ReactNode }) => {
  const { settings } = useSettings();
  const { isAuthenticated } = useAuth();

  // State
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(settings.pomodoro_duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [focusCount, setFocusCount] = useState(0);
  const [currentTask, setCurrentTask] = useLocalStorage<Task | null>('currentTask', null);
  const [sessionCompleteTrigger, setSessionCompleteTrigger] = useState(0);

  // Refs
  const modeRef = useRef(mode);
  const currentTaskRef = useRef(currentTask);
  const focusCountRef = useRef(focusCount);
  const isAuthenticatedRef = useRef(isAuthenticated);
  const startTimeRef = useRef<Date | null>(null);
  const intervalRef = useRef<number | undefined>(undefined);
  const processingRef = useRef(false);

  // Sync refs
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { currentTaskRef.current = currentTask; }, [currentTask]);
  useEffect(() => { focusCountRef.current = focusCount; }, [focusCount]);
  useEffect(() => { isAuthenticatedRef.current = isAuthenticated; }, [isAuthenticated]);

  const getDuration = useCallback((m: TimerMode) => {
    switch (m) {
      case 'focus': return settings.pomodoro_duration * 60;
      case 'shortBreak': return settings.short_break_duration * 60;
      case 'longBreak': return settings.long_break_duration * 60;
    }
  }, [settings]);

  // Reset timer when mode or duration settings change, ONLY if not running or if duration changed significantly
  // Actually, standard behavior is to reset if settings change.
  useEffect(() => {
    if (!isRunning) {
        setTimeLeft(getDuration(mode));
    }
  }, [mode, getDuration, isRunning]);

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
            setSessionCompleteTrigger(prev => prev + 1);
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
      startTimeRef.current = null;
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
  }, [isRunning]);

  // Prevent page unload when timer is running
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

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getDuration(mode));
    startTimeRef.current = null;
  };

  return (
    <TimerContext.Provider value={{
      mode,
      timeLeft,
      isRunning,
      currentTask,
      setCurrentTask,
      setMode,
      startTimer,
      pauseTimer,
      resetTimer,
      getDuration,
      sessionCompleteTrigger
    }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) throw new Error('useTimer must be used within TimerProvider');
  return context;
};
