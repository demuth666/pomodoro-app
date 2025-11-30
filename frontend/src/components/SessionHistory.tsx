import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { sessionService } from '../services/session.service';
import { type Session } from '../types';

interface SessionHistoryProps {
  refreshTrigger?: number;
}

export default function SessionHistory({ refreshTrigger = 0 }: SessionHistoryProps) {
  const { isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSessions();
    }
  }, [isAuthenticated, refreshTrigger]);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const response = await sessionService.getSessions();
      setSessions(response.data || []);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const totalTimeSeconds = sessions.reduce((acc, curr) => acc + curr.duration, 0);
  const totalHours = Math.floor(totalTimeSeconds / 3600);
  const totalMinutes = Math.floor((totalTimeSeconds % 3600) / 60);

  return (
    <div className="bg-dark-card rounded-card p-4 sm:p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Session History</h3>
        {isAuthenticated && (
          <button className="text-xs text-pomodoro-red hover:text-white transition-colors">
            View All
          </button>
        )}
      </div>

      {!isAuthenticated ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <div className="w-12 h-12 rounded-full bg-dark-gray flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-gray-300 font-medium mb-1">Login Required</p>
          <p className="text-xs text-gray-500">Please login to view your session history</p>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {isLoading ? (
                <div className="text-center text-gray-500 py-4">Loading sessions...</div>
            ) : sessions.length === 0 ? (
                <div className="text-center text-gray-500 py-4">No sessions recorded yet.</div>
            ) : (
                sessions.map((session) => (
                <div
                    key={session.id}
                    className="bg-dark-gray/50 rounded-lg p-3 flex items-center justify-between hover:bg-dark-gray transition-colors group"
                >
                    <div className="flex flex-col">
                    <span className="font-medium text-white text-sm">
                       {session.type === 'focus'
                        ? (session.task?.task || <span className="text-gray-500 italic">Deleted Task</span>)
                        : (session.type === 'short_break' ? 'Short Break' : 'Long Break')
                        }
                    </span>
                    <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
                        <span>{formatDate(session.started_at)}</span>
                        <span>•</span>
                        <span>{formatTime(session.started_at)}</span>
                    </div>
                    </div>

                    <div className="flex flex-col items-end">
                    <div className={`
                        text-xs px-2 py-0.5 rounded-full mb-1
                        ${session.status === 'completed'
                        ? 'bg-green-900/30 text-green-400 border border-green-900/50'
                        : 'bg-yellow-900/30 text-yellow-400 border border-yellow-900/50'}
                    `}>
                        {session.status === 'completed' ? 'Completed' : 'Stopped'}
                    </div>
                    <span className="text-xs text-gray-500 font-mono">{formatDuration(session.duration)}</span>
                    </div>
                </div>
                ))
            )}
          </div>

          {/* Summary Footer */}
          <div className="mt-4 pt-4 border-t border-white/5 flex justify-between text-xs text-gray-400">
            <div>Total Sessions: <span className="text-white font-medium">{sessions.length}</span></div>
            <div>Total Time: <span className="text-white font-medium">{totalHours}h {totalMinutes}m</span></div>
          </div>
        </>
      )}
    </div>
  );
}
