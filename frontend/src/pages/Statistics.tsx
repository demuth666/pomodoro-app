import { useEffect, useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { sessionService } from '../services/session.service';
import { type Session } from '../types';

const COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#1A535C', '#FF9F1C', '#2EC4B6'];

const StatCard = ({ title, value, subtitle, icon }: { title: string, value: string, subtitle: string, icon: React.ReactNode }) => (
  <div className="bg-dark-card rounded-card p-6 border border-white/5 hover:border-white/10 transition-colors">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
      <div className="p-3 bg-white/5 rounded-lg text-pomodoro-red">
        {icon}
      </div>
    </div>
  </div>
);

export default function Statistics() {
  const { isAuthenticated, openLoginModal } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'Day' | 'Week' | 'Month'>('Day');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      openLoginModal();
    } else {
        fetchSessions();
    }
  }, [isAuthenticated, openLoginModal, navigate, selectedPeriod]);

  const fetchSessions = async () => {
      setIsLoading(true);
      try {
          const periodMap: Record<string, 'day' | 'week' | 'month'> = {
              'Day': 'day',
              'Week': 'week',
              'Month': 'month'
          };
          const response = await sessionService.getSessions(periodMap[selectedPeriod]);
          setSessions(response.data || []);
      } catch (error) {
          console.error("Failed to fetch sessions", error);
      } finally {
          setIsLoading(false);
      }
  }

  const stats = useMemo(() => {
      const totalSessions = sessions.length;
      const totalDurationSeconds = sessions.reduce((acc, curr) => acc + curr.duration, 0);
      const totalHours = Math.floor(totalDurationSeconds / 3600);
      const totalMinutes = Math.floor((totalDurationSeconds % 3600) / 60);

      // Calculate streak (simplified: consecutive days with at least one session)
      let streak = 0;
      if (sessions.length > 0) {
          const sortedSessions = [...sessions].sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
          const today = new Date().toDateString();
          let currentDate = new Date(sortedSessions[0].started_at).toDateString();

          if (currentDate === today) {
              streak = 1;
              let lastDate = new Date(currentDate);

              for (let i = 1; i < sortedSessions.length; i++) {
                  const sessionDate = new Date(sortedSessions[i].started_at);
                  const sessionDateString = sessionDate.toDateString();

                  if (sessionDateString === lastDate.toDateString()) continue;

                  const expectedPrevDay = new Date(lastDate);
                  expectedPrevDay.setDate(expectedPrevDay.getDate() - 1);

                  if (sessionDateString === expectedPrevDay.toDateString()) {
                      streak++;
                      lastDate = sessionDate;
                  } else {
                      break;
                  }
              }
          }
      }

      // Calculate efficiency (completed vs stopped)
      const completedSessions = sessions.filter(s => s.status === 'completed').length;
      const efficiency = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

      return {
          totalTime: `${totalHours}h ${totalMinutes}m`,
          totalSessions,
          streak,
          efficiency
      };
  }, [sessions]);

  const weeklyData = useMemo(() => {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const data = days.map(day => ({ name: day, minutes: 0 }));

      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
      startOfWeek.setHours(0, 0, 0, 0);

      sessions.forEach(session => {
          const date = new Date(session.started_at);
          if (date >= startOfWeek) {
              const dayIndex = date.getDay();
              data[dayIndex].minutes += Math.round(session.duration / 60);
          }
      });

      return data;
  }, [sessions]);

  const projectData = useMemo(() => {
      const distribution: Record<string, number> = {};
      sessions.forEach(session => {
          const task = session.task?.task;
          distribution[task || 'Deleted Task'] = (distribution[task || 'Deleted Task'] || 0) + 1;
      });

      return Object.entries(distribution).map(([task, value], index) => ({
          name: task,
          value,
          color: COLORS[index % COLORS.length]
      }));
  }, [sessions]);

  if (isLoading) {
       return <div className="flex items-center justify-center h-full text-white">Loading statistics...</div>;
  }

  return (
    <div className={`container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl space-y-6 ${!isAuthenticated ? 'blur-sm pointer-events-none' : ''}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Statistics</h1>
          <p className="text-gray-400 text-sm">Track your focus and productivity over time</p>
        </div>
        <div className="flex bg-dark-card rounded-lg p-1 border border-white/5">
          {['Day', 'Week', 'Month'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period as 'Day' | 'Week' | 'Month')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                selectedPeriod === period
                  ? 'bg-pomodoro-red text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Focus Time"
          value={stats.totalTime}
          subtitle="All time"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Sessions Completed"
          value={stats.totalSessions.toString()}
          subtitle="Total sessions"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Current Streak"
          value={`${stats.streak} Days`}
          subtitle="Keep it up!"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
            </svg>
          }
        />
        <StatCard
          title="Efficiency"
          value={`${stats.efficiency}%`}
          subtitle="Completion rate"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <div className="lg:col-span-2 bg-dark-card rounded-card p-6 border border-white/5">
          <h3 className="text-lg font-semibold text-white mb-6">Weekly Activity</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#666"
                  tick={{ fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#666"
                  tick={{ fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${value}m`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                />
                <Bar
                  dataKey="minutes"
                  fill="#FF6B6B"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="lg:col-span-1 bg-dark-card rounded-card p-6 border border-white/5">
          <h3 className="text-lg font-semibold text-white mb-6">Session Types</h3>
          <div className="h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {projectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 flex-wrap">
              {projectData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-gray-400">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
