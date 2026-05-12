import React, { useMemo } from 'react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, BarChart, Bar, Legend, RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { Assignment, AssignmentStatus } from '../types';
import { TrendingUp, CheckCircle, Clock, Star, DollarSign } from 'lucide-react';

interface WriterAnalyticsProps {
    assignments: Assignment[];
}

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

const WriterAnalytics: React.FC<WriterAnalyticsProps> = ({ assignments }) => {
    
    const stats = useMemo(() => {
        const completed = assignments.filter(a => a.status === AssignmentStatus.COMPLETED);
        const pending = assignments.filter(a => a.status === AssignmentStatus.IN_PROGRESS || a.status === AssignmentStatus.ASSIGNED);
        const rate = assignments.length > 0 ? (completed.length / (completed.length + pending.length || 1)) * 100 : 0;
        
        const totalEarnings = completed.reduce((sum, a) => sum + (a.budget * 0.9), 0);
        
        // Subject Distribution
        const subjects: Record<string, number> = {};
        assignments.forEach(a => {
            subjects[a.subject] = (subjects[a.subject] || 0) + 1;
        });
        const subjectData = Object.entries(subjects).map(([name, value]) => ({ name, value }));

        // Radar data for "Skills" (simulated based on subjects)
        const skillsData = [
            { subject: 'Math', A: 80, fullMark: 150 },
            { subject: 'Science', A: 98, fullMark: 150 },
            { subject: 'History', A: 86, fullMark: 150 },
            { subject: 'Coding', A: 99, fullMark: 150 },
            { subject: 'English', A: 85, fullMark: 150 },
        ];

        return {
            completed: completed.length,
            pending: pending.length,
            completionRate: Math.round(rate),
            totalEarnings: Math.round(totalEarnings),
            subjectData,
            skillsData
        };
    }, [assignments]);

    const pieData = [
        { name: 'Completed', value: stats.completed },
        { name: 'In Progress', value: stats.pending },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Completion Rate Chart */}
            <div className="glass-card-premium p-6 col-span-1">
                <h3 className="text-sm font-bold text-[var(--text-tertiary)] uppercase mb-4 flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-500" /> Completion Rate
                </h3>
                <div className="h-40 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={60}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ 
                                    background: 'var(--bg-secondary)', 
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-bold text-[var(--text-primary)]">{stats.completionRate}%</span>
                    </div>
                </div>
            </div>

            {/* Subject Distribution */}
            <div className="glass-card-premium p-6 col-span-1">
                <h3 className="text-sm font-bold text-[var(--text-tertiary)] uppercase mb-4 flex items-center gap-2">
                    <TrendingUp size={14} className="text-violet-500" /> Subject Mix
                </h3>
                <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.subjectData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                            <XAxis dataKey="name" hide />
                            <Tooltip 
                                contentStyle={{ 
                                    background: 'var(--bg-secondary)', 
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px'
                                }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {stats.subjectData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Skills Radar */}
            <div className="glass-card-premium p-6 col-span-1 lg:col-span-2">
                <h3 className="text-sm font-bold text-[var(--text-tertiary)] uppercase mb-4 flex items-center gap-2">
                    <Star size={14} className="text-amber-500" /> Skill Proficiency
                </h3>
                <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats.skillsData}>
                            <PolarGrid stroke="var(--border)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} />
                            <Radar
                                name="Writer"
                                dataKey="A"
                                stroke="#8b5cf6"
                                fill="#8b5cf6"
                                fillOpacity={0.5}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default WriterAnalytics;
