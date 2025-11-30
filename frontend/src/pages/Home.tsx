import { useState } from 'react';
import Timer from '../components/Timer';
import TaskList from '../components/TaskList';
import  SessionHistory from '../components/SessionHistory';
import { type Task } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function Home() {
  const [currentTask, setCurrentTask] = useLocalStorage<Task | null>('currentTask', null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 m:py-6 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 grid-flow-dense">
        <div className="lg:col-span-2">
          <Timer currentTask={currentTask} onSessionComplete={() => setRefreshTrigger(n => n + 1)} />
        </div>
        <div className="lg:col-span-1">
          <TaskList
            onTaskSelect={setCurrentTask}
            activeTaskId={currentTask?.id}
            onTaskUpdate={() => setRefreshTrigger(n => n + 1)}
          />
        </div>
        <div className="lg:col-span-3">
          <SessionHistory refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
}
