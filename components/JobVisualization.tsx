import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { GoogleJob } from '../services/googleJobsService';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';

interface JobVisualizationProps {
  jobs: GoogleJob[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const JobVisualization: React.FC<JobVisualizationProps> = ({ jobs }) => {
  const locationData = useMemo(() => {
    const counts: Record<string, number> = {};
    jobs.forEach(job => {
      const loc = job.job_location || 'Unknown';
      counts[loc] = (counts[loc] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [jobs]);

  const typeData = useMemo(() => {
    const counts: Record<string, number> = {};
    jobs.forEach(job => {
      const type = job.job_employment_type?.replace('_', ' ') || 'Other';
      const formattedType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
      counts[formattedType] = (counts[formattedType] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [jobs]);

  const sourceData = useMemo(() => {
    const counts: Record<string, number> = {};
    jobs.forEach(job => {
      const source = job.source || 'Unknown';
      counts[source] = (counts[source] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [jobs]);

  if (jobs.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-12"
    >
      {/* Location Distribution */}
      <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] relative overflow-hidden group">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-emerald-50/20 rounded-full blur-3xl group-hover:bg-emerald-100/40 transition-colors duration-700" />
        
        <div className="flex items-center gap-4 mb-8 sm:mb-10 relative z-10">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
            <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Jobs by Location</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Top 8 regions</p>
          </div>
        </div>
        
        <div className="h-[250px] sm:h-[300px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={locationData} layout="vertical" margin={{ left: 40, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={100} 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8', textAnchor: 'end' }}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ 
                  borderRadius: '1.5rem', 
                  border: '1px solid #f1f5f9', 
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', 
                  fontSize: '12px',
                  fontWeight: 'bold',
                  padding: '12px 16px'
                }}
              />
              <Bar dataKey="value" fill="#10b981" radius={[0, 8, 8, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Employment Type Distribution */}
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] relative overflow-hidden group">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-emerald-50/20 rounded-full blur-3xl group-hover:bg-emerald-100/40 transition-colors duration-700" />
        
        <div className="flex items-center gap-4 mb-10 relative z-10">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Employment Types</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Market distribution</p>
          </div>
        </div>

        <div className="h-[300px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={95}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '1.5rem', 
                  border: '1px solid #f1f5f9', 
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', 
                  fontSize: '12px',
                  fontWeight: 'bold',
                  padding: '12px 16px'
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
                formatter={(value) => <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Source Distribution */}
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] relative overflow-hidden group">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-emerald-50/20 rounded-full blur-3xl group-hover:bg-emerald-100/40 transition-colors duration-700" />
        
        <div className="flex items-center gap-4 mb-10 relative z-10">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
            <PieChartIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Job Sources</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Where jobs were found</p>
          </div>
        </div>

        <div className="h-[300px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sourceData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={95}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {sourceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '1.5rem', 
                  border: '1px solid #f1f5f9', 
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', 
                  fontSize: '12px',
                  fontWeight: 'bold',
                  padding: '12px 16px'
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
                formatter={(value) => <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

export default JobVisualization;
